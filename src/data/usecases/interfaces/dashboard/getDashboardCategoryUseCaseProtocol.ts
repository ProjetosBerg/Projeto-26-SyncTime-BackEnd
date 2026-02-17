export interface DashboardData {
  summary: {
    totalCategories: number;
    totalMonthlyRecords: number;
    totalTransactions: number;
    totalAmount: number;
    averageTransactionAmount: number;
    categoryBreakdown: Array<{
      categoryId: string;
      categoryName: string;
      categoryType: string;
      recordTypeId: number;
      recordTypeName: string;
      totalRecords: number;
      totalTransactions: number;
      totalAmount: number;
      percentage: number;
    }>;
  };
  pieChartData: Array<{
    name: string;
    value: number;
    percentage: number;
    color?: string;
  }>;
  barChartData: Array<{
    category: string;
    amount: number;
    transactions: number;
    records: number;
  }>;
  timeSeriesData: Array<{
    period: string;
    periodLabel: string;
    totalAmount: number;
    totalTransactions: number;
    categories: Array<{
      categoryId: string;
      categoryName: string;
      amount: number;
      transactions: number;
    }>;
  }>;
  scatterData: Array<{
    categoryName: string;
    recordsCount: number;
    transactionsCount: number;
    averageAmount: number;
    totalAmount: number;
  }>;
  customFieldPieCharts: Array<{
    label: string;
    data: Array<{
      name: string;
      value: number;
      percentage: number;
    }>;
  }>;
  topTransactions: Array<{
    id: string;
    title: string;
    amount: number;
    date: string;
    categoryName: string;
  }>;
  transactionHistogram: Array<{
    bin: string;
    count: number;
    totalAmount: number;
  }>;
  goalProgressData: Array<{
    recordId: string;
    title: string;
    goal: string | number;
    initialBalance: number;
    currentTotal: number;
    progress: number;
  }>;
  transactionCountPieChart: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  categoryTypeBarChart: Array<{
    type: string;
    transactionCount: number;
    categoryCount: number;
  }>;
  customFieldValueCounts: Array<{
    label: string;
    data: Array<{
      name: string;
      count: number;
    }>;
    sums: Array<{
      name: string;
      total: number;
    }>;
    totalSum: number;
  }>;
  transactionDateHistogram: Array<{
    period: string;
    periodLabel: string;
    totalTransactions: number;
  }>;
  detailedData: Array<{
    category: {
      id: string;
      name: string;
      description: string;
      type: string;
      recordTypeId: number;
      recordTypeName: string;
    };
    monthlyRecords: Array<{
      id: string;
      title: string;
      description: string | null;
      goal: string;
      initialBalance: number;
      month: number;
      year: number;
      status: string;
      transactionsSummary: {
        count: number;
        totalAmount: number;
        averageAmount: number;
        minAmount: number;
        maxAmount: number;
        firstTransactionDate: string | null;
        lastTransactionDate: string | null;
      };
      transactions: Array<{
        id: string;
        title: string;
        description: string | null;
        amount: number;
        transactionDate: string;
        customFields?: Array<{
          label: string;
          value: any;
          type: string;
        }>;
      }>;
    }>;
  }>;
  filters: {
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    groupBy: "day" | "week" | "month" | "year";
  };
  customChartsData: {
    categories: {
      distributionRecordType: Array<{
        name: string;
        value: number;
        categories: string[];
      }>;
      transactionCount: Array<{ name: string; count: number }>;
      categoryType: Array<{
        type: string;
        transactionCount: number;
        categoryCount: number;
      }>;
    };
    customFields: Array<{
      label: string;
      data: Array<{ name: string; count: number }>;
      sums: Array<{ name: string; total: number }>;
      totalSum: number;
    }>;
    transactions: {
      transactionsByCategory: Array<{ category: string; transactions: number }>;
      statusDistribution: Array<{
        name: string;
        count: number;
        percentage: number;
      }>;
      dateHistogram: Array<{ periodLabel: string; totalTransactions: number }>;
      valueHistogram: Array<{
        bin: string;
        count: number;
        totalAmount: number;
      }>;
    };
    evolution: {
      timeEvolution: Array<{
        periodLabel: string;
        totalAmount: number;
        totalTransactions: number;
      }>;
      recordsVsAverage: Array<{
        recordsCount: number;
        averageAmount: number;
        totalAmount: number;
      }>;
    };
    progress: {
      progressByRecord: Array<{
        title: string;
        initialBalance: number;
        currentTotal: number;
      }>;
    };
  };
}
export interface GetDashboardCategoryUseCaseProtocol {
  handle(
    data: GetDashboardCategoryUseCaseProtocol.Params
  ): Promise<DashboardData>;
}
export namespace GetDashboardCategoryUseCaseProtocol {
  export type Params = {
    userId: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: "day" | "week" | "month" | "year";
  };
}
