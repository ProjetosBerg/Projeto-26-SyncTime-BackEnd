import { ServerError } from "@/data/errors/ServerError";
import { NotFoundError } from "@/data/errors/NotFoundError";
import { UserRepositoryProtocol } from "@/infra/db/interfaces/userRepositoryProtocol";
import { CategoryRepositoryProtocol } from "@/infra/db/interfaces/categoryRepositoryProtocol";
import { MonthlyRecordRepositoryProtocol } from "@/infra/db/interfaces/monthlyRecordRepositoryProtocol";
import { TransactionRepositoryProtocol } from "@/infra/db/interfaces/transactionRepositoryProtocol";
import { TransactionCustomFieldRepositoryProtocol } from "@/infra/db/interfaces/TransactionCustomFieldRepositoryProtocol";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import {
  GetDashboardCategoryUseCaseProtocol,
  DashboardData,
} from "../interfaces/dashboard/getDashboardCategoryUseCaseProtocol";
import { getDashboardCategoryValidationSchema } from "../validation/dashboard/getDashboardCategoryValidationSchema";
/**
 * Recupera dados agregados do dashboard para visualização em diversos tipos de gráficos
 * Inclui categorias, registros mensais e transações com suporte a filtros
 */
export class GetDashboardCategoryUseCase
  implements GetDashboardCategoryUseCaseProtocol
{
  constructor(
    private readonly userRepository: UserRepositoryProtocol,
    private readonly categoryRepository: CategoryRepositoryProtocol,
    private readonly monthlyRecordRepository: MonthlyRecordRepositoryProtocol,
    private readonly transactionRepository: TransactionRepositoryProtocol,
    private readonly customFieldRepository: CustomFieldsRepositoryProtocol,
    private readonly transactionCustomFieldRepository: TransactionCustomFieldRepositoryProtocol
  ) {}
  async handle(
    data: GetDashboardCategoryUseCaseProtocol.Params
  ): Promise<DashboardData> {
    try {
      await getDashboardCategoryValidationSchema.validate(data, {
        abortEarly: false,
      });
      const user = await this.userRepository.findOne({ id: data.userId });
      if (!user) {
        throw new NotFoundError(`Usuário com ID ${data.userId} não encontrado`);
      }
      const categories = data.categoryId
        ? [
            await this.categoryRepository.findByIdAndUserId({
              id: data.categoryId,
              userId: data.userId,
            }),
          ].filter(Boolean)
        : (
            await this.categoryRepository.findByUserId({
              userId: data.userId,
            })
          ).categories;
      if (categories.length === 0) {
        throw new NotFoundError("Nenhuma categoria encontrada");
      }
      const allMonthlyRecords: any = [];
      for (const category of categories) {
        const { records } = await this.monthlyRecordRepository.findByUserId({
          userId: data.userId,
          categoryId: category!.id,
          page: 1,
          limit: 1000,
        });
        if (records.length === 0) {
          continue;
        }
        allMonthlyRecords.push(...records);
      }
      let filteredRecords = allMonthlyRecords;
      if (data.startDate || data.endDate) {
        filteredRecords = this.filterRecordsByDate(
          allMonthlyRecords,
          data.startDate,
          data.endDate
        );
      }
      const detailedData = await this.buildDetailedData(
        categories,
        filteredRecords,
        data.userId
      );
      const summary = this.calculateSummary(detailedData);
      const pieChartData = this.generatePieChartData(detailedData);
      const barChartData = this.generateBarChartData(detailedData);
      const timeSeriesData = this.generateTimeSeriesData(
        detailedData,
        data.groupBy || "month"
      );
      const scatterData = this.generateScatterData(detailedData);
      const customFieldPieCharts =
        this.generateCustomFieldPieCharts(detailedData);
      const topTransactions = this.generateTopTransactions(detailedData);
      const transactionHistogram =
        this.generateTransactionHistogram(detailedData);
      const goalProgressData = this.generateGoalProgressData(detailedData);
      const transactionCountPieChart =
        this.generateTransactionCountPieChart(detailedData);
      const statusDistribution = this.generateStatusDistribution(detailedData);
      const categoryTypeBarChart =
        this.generateCategoryTypeBarChart(detailedData);
      const customFieldAggregates =
        this.generateCustomFieldAggregates(detailedData);
      const transactionDateHistogram = this.generateTransactionDateHistogram(
        detailedData,
        data.groupBy || "month"
      );
      const customChartsData = this.generateCustomChartsData(
        detailedData,
        summary,
        transactionCountPieChart,
        categoryTypeBarChart,
        customFieldAggregates,
        barChartData,
        statusDistribution,
        transactionDateHistogram,
        transactionHistogram,
        timeSeriesData,
        scatterData,
        goalProgressData
      );
      return {
        summary,
        pieChartData,
        barChartData,
        timeSeriesData,
        scatterData,
        customFieldPieCharts,
        topTransactions,
        transactionHistogram,
        goalProgressData,
        transactionCountPieChart,
        statusDistribution,
        categoryTypeBarChart,
        customFieldValueCounts: customFieldAggregates,
        transactionDateHistogram,
        detailedData,
        filters: {
          categoryId: data.categoryId,
          startDate: data.startDate,
          endDate: data.endDate,
          groupBy: data.groupBy || "month",
        },
        customChartsData,
      };
    } catch (error: any) {
      if (error.name === "ValidationError") {
        throw error;
      }
      if (error instanceof NotFoundError) {
        throw error;
      }
      const errorMessage =
        error.message || "Erro interno do servidor durante a busca";
      throw new ServerError(
        `Falha na busca dos dados do dashboard: ${errorMessage}`
      );
    }
  }
  private filterRecordsByDate(
    records: any[],
    startDate?: string,
    endDate?: string
  ): any[] {
    return records.filter((record) => {
      const recordDate = new Date(record.year, record.month - 1);
      if (startDate) {
        const start = new Date(startDate);
        if (recordDate < new Date(start.getFullYear(), start.getMonth())) {
          return false;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (recordDate > new Date(end.getFullYear(), end.getMonth())) {
          return false;
        }
      }
      return true;
    });
  }
  private async buildDetailedData(
    categories: any[],
    monthlyRecords: any[],
    userId: string
  ): Promise<DashboardData["detailedData"]> {
    const detailedData: DashboardData["detailedData"] = [];
    for (const category of categories) {
      const categoryRecords = monthlyRecords.filter(
        (r) => r.category_id === category!.id
      );
      const enrichedRecords = await Promise.all(
        categoryRecords.map(async (record) => {
          const transactions = record.transactions || [];
          const enrichedTransactions = await Promise.all(
            transactions.map(async (transaction: any) => {
              const customFieldValues =
                await this.transactionCustomFieldRepository.findByTransactionId(
                  {
                    transaction_id: transaction.id,
                    user_id: userId,
                  }
                );
              let customFields: any[] = [];
              if (customFieldValues.length > 0) {
                const { customFields: customFieldDefs } =
                  await this.customFieldRepository.findByRecordTypeId({
                    record_type_id: category!.record_type_id,
                    category_id: category!.id,
                    user_id: userId,
                  });
                customFields = customFieldValues.map((value) => {
                  const cfDef = customFieldDefs.find(
                    (cf) => cf.id === value.custom_field_id
                  );
                  return {
                    label: cfDef?.label || "Unknown",
                    value: value.value,
                    type: cfDef?.type || "text",
                  };
                });
              }
              return {
                id: transaction.id,
                title: transaction.title,
                description: transaction.description,
                amount: parseFloat(transaction.amount),
                transactionDate: transaction.transaction_date,
                customFields:
                  customFields.length > 0 ? customFields : undefined,
              };
            })
          );
          const amounts = enrichedTransactions.map((t) => t.amount);
          const dates = enrichedTransactions
            .map((t) => t.transactionDate)
            .sort();
          return {
            id: record.id,
            title: record.title,
            description: record.description,
            goal: record.goal,
            initialBalance: parseFloat(record.initial_balance || 0),
            month: record.month,
            year: record.year,
            status: record.status,
            transactionsSummary: {
              count: enrichedTransactions.length,
              totalAmount: amounts.reduce((sum, a) => sum + a, 0),
              averageAmount:
                amounts.length > 0
                  ? amounts.reduce((sum, a) => sum + a, 0) / amounts.length
                  : 0,
              minAmount: amounts.length > 0 ? Math.min(...amounts) : 0,
              maxAmount: amounts.length > 0 ? Math.max(...amounts) : 0,
              firstTransactionDate: dates[0] || null,
              lastTransactionDate: dates[dates.length - 1] || null,
            },
            transactions: enrichedTransactions,
          };
        })
      );
      detailedData.push({
        category: {
          id: category!.id,
          name: category!.name,
          description: category!.description,
          type: category!.type,
          recordTypeId: category!.record_type_id,
          recordTypeName: category!.record_type_name,
        },
        monthlyRecords: enrichedRecords,
      });
    }
    return detailedData;
  }
  private calculateSummary(
    detailedData: DashboardData["detailedData"]
  ): DashboardData["summary"] {
    let totalMonthlyRecords = 0;
    let totalTransactions = 0;
    let totalAmount = 0;
    const categoryBreakdown = detailedData.map((item) => {
      const recordCount = item.monthlyRecords.length;
      const transactionCount = item.monthlyRecords.reduce(
        (sum, r) => sum + r.transactionsSummary.count,
        0
      );
      const categoryAmount = item.monthlyRecords.reduce(
        (sum, r) => sum + r.transactionsSummary.totalAmount,
        0
      );
      totalMonthlyRecords += recordCount;
      totalTransactions += transactionCount;
      totalAmount += categoryAmount;
      return {
        categoryId: item.category.id,
        categoryName: item.category.name,
        categoryType: item.category.type,
        recordTypeId: item.category.recordTypeId,
        recordTypeName: item.category.recordTypeName,
        totalRecords: recordCount,
        totalTransactions: transactionCount,
        totalAmount: categoryAmount,
        percentage: 0,
      };
    });
    categoryBreakdown.forEach((item) => {
      item.percentage =
        totalAmount > 0 ? (item.totalAmount / totalAmount) * 100 : 0;
    });
    return {
      totalCategories: detailedData.length,
      totalMonthlyRecords,
      totalTransactions,
      totalAmount,
      averageTransactionAmount:
        totalTransactions > 0 ? totalAmount / totalTransactions : 0,
      categoryBreakdown,
    };
  }
  private generatePieChartData(
    detailedData: DashboardData["detailedData"]
  ): DashboardData["pieChartData"] {
    const totalAmount = detailedData.reduce(
      (sum, item) =>
        sum +
        item.monthlyRecords.reduce(
          (s, r) => s + r.transactionsSummary.totalAmount,
          0
        ),
      0
    );
    return detailedData.map((item) => {
      const value = item.monthlyRecords.reduce(
        (sum, r) => sum + r.transactionsSummary.totalAmount,
        0
      );
      return {
        name: item.category.name,
        value: parseFloat(value.toFixed(2)),
        percentage: totalAmount > 0 ? (value / totalAmount) * 100 : 0,
      };
    });
  }
  private generateBarChartData(
    detailedData: DashboardData["detailedData"]
  ): DashboardData["barChartData"] {
    return detailedData.map((item) => ({
      category: item.category.name,
      amount: item.monthlyRecords.reduce(
        (sum, r) => sum + r.transactionsSummary.totalAmount,
        0
      ),
      transactions: item.monthlyRecords.reduce(
        (sum, r) => sum + r.transactionsSummary.count,
        0
      ),
      records: item.monthlyRecords.length,
    }));
  }
  private generateTimeSeriesData(
    detailedData: DashboardData["detailedData"],
    groupBy: "day" | "week" | "month" | "year"
  ): DashboardData["timeSeriesData"] {
    const periodsMap = new Map<string, any>();
    detailedData.forEach((item) => {
      item.monthlyRecords.forEach((record) => {
        record.transactions.forEach((transaction) => {
          const period = this.getPeriodKey(
            transaction.transactionDate,
            groupBy
          );
          const periodLabel = this.getPeriodLabel(
            transaction.transactionDate,
            groupBy
          );
          if (!periodsMap.has(period)) {
            periodsMap.set(period, {
              period,
              periodLabel,
              totalAmount: 0,
              totalTransactions: 0,
              categories: new Map<string, any>(),
            });
          }
          const periodData = periodsMap.get(period);
          periodData.totalAmount += transaction.amount;
          periodData.totalTransactions += 1;
          if (!periodData.categories.has(item.category.id)) {
            periodData.categories.set(item.category.id, {
              categoryId: item.category.id,
              categoryName: item.category.name,
              amount: 0,
              transactions: 0,
            });
          }
          const catData = periodData.categories.get(item.category.id);
          catData.amount += transaction.amount;
          catData.transactions += 1;
        });
      });
    });
    return Array.from(periodsMap.values())
      .map((p) => ({
        ...p,
        categories: Array.from(p.categories.values()),
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }
  private generateScatterData(
    detailedData: DashboardData["detailedData"]
  ): DashboardData["scatterData"] {
    return detailedData.map((item) => {
      const transactionsCount = item.monthlyRecords.reduce(
        (sum, r) => sum + r.transactionsSummary.count,
        0
      );
      const totalAmount = item.monthlyRecords.reduce(
        (sum, r) => sum + r.transactionsSummary.totalAmount,
        0
      );
      return {
        categoryName: item.category.name,
        recordsCount: item.monthlyRecords.length,
        transactionsCount,
        averageAmount:
          transactionsCount > 0 ? totalAmount / transactionsCount : 0,
        totalAmount,
      };
    });
  }
  private generateCustomFieldPieCharts(
    detailedData: DashboardData["detailedData"]
  ): DashboardData["customFieldPieCharts"] {
    const customFieldMap = new Map<string, Map<string, number>>();
    detailedData.forEach((item) => {
      item.monthlyRecords.forEach((record) => {
        record.transactions.forEach((transaction) => {
          if (transaction.customFields) {
            transaction.customFields.forEach((cf: any) => {
              const label = cf.label;
              let valueKey: string;
              if (cf.type === "multiple" && Array.isArray(cf.value)) {
                valueKey = cf.value.join(", ");
              } else {
                valueKey = cf.value.toString();
              }
              if (!customFieldMap.has(label)) {
                customFieldMap.set(label, new Map<string, number>());
              }
              const valueMap = customFieldMap.get(label)!;
              const currentAmount = valueMap.get(valueKey) || 0;
              valueMap.set(valueKey, currentAmount + transaction.amount);
            });
          }
        });
      });
    });
    return Array.from(customFieldMap.entries()).map(([label, valueMap]) => {
      const totalForLabel = Array.from(valueMap.values()).reduce(
        (sum, v) => sum + v,
        0
      );
      const data = Array.from(valueMap.entries()).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
        percentage: totalForLabel > 0 ? (value / totalForLabel) * 100 : 0,
      }));
      return { label, data };
    });
  }
  private generateTopTransactions(
    detailedData: DashboardData["detailedData"]
  ): DashboardData["topTransactions"] {
    const allTransactions: Array<{
      id: string;
      title: string;
      amount: number;
      date: string;
      categoryName: string;
    }> = [];
    detailedData.forEach((item) => {
      item.monthlyRecords.forEach((record) => {
        record.transactions.forEach((transaction) => {
          allTransactions.push({
            id: transaction.id,
            title: transaction.title,
            amount: transaction.amount,
            date: transaction.transactionDate,
            categoryName: item.category.name,
          });
        });
      });
    });
    return allTransactions.sort((a, b) => b.amount - a.amount).slice(0, 5);
  }
  private generateTransactionHistogram(
    detailedData: DashboardData["detailedData"]
  ): DashboardData["transactionHistogram"] {
    const bins = [
      { min: 0, max: 10, label: "0-10" },
      { min: 10, max: 50, label: "10-50" },
      { min: 50, max: 100, label: "50-100" },
      { min: 100, max: 200, label: "100-200" },
      { min: 200, max: Infinity, label: "200+" },
    ];
    const histogram = bins.map((b) => ({
      bin: b.label,
      count: 0,
      totalAmount: 0,
    }));
    detailedData.forEach((item) => {
      item.monthlyRecords.forEach((record) => {
        record.transactions.forEach((transaction) => {
          const amount = transaction.amount;
          const binIndex = bins.findIndex(
            (b) => amount >= b.min && amount < b.max
          );
          if (binIndex !== -1) {
            histogram[binIndex].count += 1;
            histogram[binIndex].totalAmount += amount;
          }
        });
      });
    });
    return histogram;
  }
  private generateGoalProgressData(
    detailedData: DashboardData["detailedData"]
  ): DashboardData["goalProgressData"] {
    return detailedData.flatMap((item) =>
      item.monthlyRecords.map((record) => {
        const currentTotal =
          record.initialBalance + record.transactionsSummary.totalAmount;
        const progress =
          record.goal && typeof record.goal === "number" && record.goal > 0
            ? (currentTotal / record.goal) * 100
            : 0;
        return {
          recordId: record.id,
          title: record.title,
          goal: record.goal,
          initialBalance: record.initialBalance,
          currentTotal,
          progress: parseFloat(progress.toFixed(2)),
        };
      })
    );
  }
  private generateTransactionCountPieChart(
    detailedData: DashboardData["detailedData"]
  ): DashboardData["transactionCountPieChart"] {
    const totalTransactions = detailedData.reduce(
      (sum, item) =>
        sum +
        item.monthlyRecords.reduce(
          (s, r) => s + r.transactionsSummary.count,
          0
        ),
      0
    );
    return detailedData.map((item) => {
      const count = item.monthlyRecords.reduce(
        (sum, r) => sum + r.transactionsSummary.count,
        0
      );
      return {
        name: item.category.name,
        count,
        percentage:
          totalTransactions > 0 ? (count / totalTransactions) * 100 : 0,
      };
    });
  }
  private generateStatusDistribution(
    detailedData: DashboardData["detailedData"]
  ): DashboardData["statusDistribution"] {
    const statusMap = new Map<string, number>();
    detailedData.forEach((item) => {
      item.monthlyRecords.forEach((record) => {
        const status = record.status || "Unknown";
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });
    });
    const totalRecords = Array.from(statusMap.values()).reduce(
      (sum, c) => sum + c,
      0
    );
    return Array.from(statusMap.entries()).map(([name, count]) => ({
      name,
      count,
      percentage: totalRecords > 0 ? (count / totalRecords) * 100 : 0,
    }));
  }
  private generateCategoryTypeBarChart(
    detailedData: DashboardData["detailedData"]
  ): DashboardData["categoryTypeBarChart"] {
    const typeMap = new Map<string, { count: number; categories: number }>();
    detailedData.forEach((item) => {
      const type = item.category.type || "Unknown";
      if (!typeMap.has(type)) {
        typeMap.set(type, { count: 0, categories: 0 });
      }
      const data = typeMap.get(type)!;
      data.categories += 1;
      data.count += item.monthlyRecords.reduce(
        (sum, r) => sum + r.transactionsSummary.count,
        0
      );
    });
    return Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      transactionCount: data.count,
      categoryCount: data.categories,
    }));
  }
  private generateCustomFieldAggregates(
    detailedData: DashboardData["detailedData"]
  ): DashboardData["customFieldValueCounts"] {
    const customFieldMap = new Map<
      string,
      { counts: Map<string, number>; sums: Map<string, number> }
    >();
    detailedData.forEach((item) => {
      item.monthlyRecords.forEach((record) => {
        record.transactions.forEach((transaction) => {
          if (transaction.customFields) {
            transaction.customFields.forEach((cf: any) => {
              const label = cf.label;
              if (!customFieldMap.has(label)) {
                customFieldMap.set(label, {
                  counts: new Map<string, number>(),
                  sums: new Map<string, number>(),
                });
              }
              const agg = customFieldMap.get(label)!;
              let valueKey: string;
              if (cf.type === "multiple" && Array.isArray(cf.value)) {
                valueKey = cf.value.join(", ");
              } else {
                valueKey = cf.value.toString();
              }
              agg.counts.set(valueKey, (agg.counts.get(valueKey) || 0) + 1);
              if (typeof cf.value === "number") {
                agg.sums.set(
                  valueKey,
                  (agg.sums.get(valueKey) || 0) + cf.value
                );
              }
            });
          }
        });
      });
    });
    return Array.from(customFieldMap.entries()).map(([label, agg]) => {
      const data = Array.from(agg.counts.entries()).map(([name, count]) => ({
        name,
        count,
      }));
      const sums = Array.from(agg.sums.entries()).map(([name, total]) => ({
        name,
        total,
      }));
      const totalSum = Array.from(agg.sums.values()).reduce((s, v) => s + v, 0);
      return { label, data, sums, totalSum };
    });
  }
  private generateTransactionDateHistogram(
    detailedData: DashboardData["detailedData"],
    groupBy: "day" | "week" | "month" | "year"
  ): DashboardData["transactionDateHistogram"] {
    const periodsMap = new Map<
      string,
      { period: string; periodLabel: string; totalTransactions: number }
    >();
    detailedData.forEach((item) => {
      item.monthlyRecords.forEach((record) => {
        record.transactions.forEach((transaction) => {
          const period = this.getPeriodKey(
            transaction.transactionDate,
            groupBy
          );
          const periodLabel = this.getPeriodLabel(
            transaction.transactionDate,
            groupBy
          );
          if (!periodsMap.has(period)) {
            periodsMap.set(period, {
              period,
              periodLabel,
              totalTransactions: 0,
            });
          }
          const periodData = periodsMap.get(period)!;
          periodData.totalTransactions += 1;
        });
      });
    });
    return Array.from(periodsMap.values()).sort((a, b) =>
      a.period.localeCompare(b.period)
    );
  }
  private getPeriodKey(
    date: string,
    groupBy: "day" | "week" | "month" | "year"
  ): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    switch (groupBy) {
      case "day":
        return `${year}-${month}-${day}`;
      case "week":
        const week = this.getWeekNumber(d);
        return `${year}-W${String(week).padStart(2, "0")}`;
      case "month":
        return `${year}-${month}`;
      case "year":
        return `${year}`;
      default:
        return `${year}-${month}`;
    }
  }
  private getPeriodLabel(
    date: string,
    groupBy: "day" | "week" | "month" | "year"
  ): string {
    const d = new Date(date);
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    switch (groupBy) {
      case "day":
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      case "week":
        const week = this.getWeekNumber(d);
        return `Semana ${week}, ${d.getFullYear()}`;
      case "month":
        return `${months[d.getMonth()]} ${d.getFullYear()}`;
      case "year":
        return `${d.getFullYear()}`;
      default:
        return `${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  }
  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
  private generateCustomChartsData(
    detailedData: DashboardData["detailedData"],
    summary: DashboardData["summary"],
    transactionCountPieChart: DashboardData["transactionCountPieChart"],
    categoryTypeBarChart: DashboardData["categoryTypeBarChart"],
    customFieldAggregates: DashboardData["customFieldValueCounts"],
    barChartData: DashboardData["barChartData"],
    statusDistribution: DashboardData["statusDistribution"],
    transactionDateHistogram: DashboardData["transactionDateHistogram"],
    transactionHistogram: DashboardData["transactionHistogram"],
    timeSeriesData: DashboardData["timeSeriesData"],
    scatterData: DashboardData["scatterData"],
    goalProgressData: DashboardData["goalProgressData"]
  ) {
    return {
      categories: {
        distributionRecordType: Object.entries(
          (summary.categoryBreakdown || []).reduce(
            (acc, cat) => {
              if (!cat) return acc;
              if (!acc[cat.recordTypeName]) {
                acc[cat.recordTypeName] = {
                  name: cat.recordTypeName,
                  value: 0,
                  categories: [],
                };
              }
              acc[cat.recordTypeName].value += 1;
              acc[cat.recordTypeName].categories.push(cat.categoryName);
              return acc;
            },
            {} as Record<
              string,
              { name: string; value: number; categories: string[] }
            >
          )
        ).map(([_, d]) => d),

        transactionCount: (transactionCountPieChart || [])
          .filter((d) => d.count > 0)
          .map((d) => ({
            name: d.name,
            count: d.count,
          })),

        categoryType: categoryTypeBarChart || [],
      },
      customFields: customFieldAggregates || [],
      transactions: {
        transactionsByCategory: (barChartData || [])
          .filter((d) => d.amount > 0 || d.transactions > 0)
          .map((d) => ({
            category: d.category,
            transactions: d.transactions,
          })),

        statusDistribution: (statusDistribution || []).filter(
          (d) => d.count > 0
        ),

        dateHistogram: transactionDateHistogram || [],

        valueHistogram: (transactionHistogram || []).filter((d) => d.count > 0),
      },
      evolution: {
        timeEvolution: (timeSeriesData || []).map((d) => ({
          periodLabel: d.periodLabel,
          totalAmount: d.totalAmount,
          totalTransactions: d.totalTransactions,
        })),

        recordsVsAverage: (scatterData || [])
          .filter((d) => d.totalAmount > 0)
          .map((d) => ({
            recordsCount: d.recordsCount,
            averageAmount: d.averageAmount,
            totalAmount: d.totalAmount,
          })),
      },
      progress: {
        progressByRecord: goalProgressData || [],
      },
    };
  }
}
