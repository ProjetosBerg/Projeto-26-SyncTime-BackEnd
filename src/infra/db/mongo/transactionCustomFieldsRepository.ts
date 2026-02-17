import { TransactionCustomFieldValueModel } from "@/domain/entities/mongo/TransactionCustomFieldValueSchema";
import { TransactionCustomFieldRepositoryProtocol } from "../interfaces/TransactionCustomFieldRepositoryProtocol";
import { TransactionCustomFieldValueModel as TransactionCustomFieldModel } from "@/domain/models/mongo/TransactionCustomFieldValueModel";

export class TransactionCustomFieldRepository
  implements TransactionCustomFieldRepositoryProtocol
{
  async create(
    data: TransactionCustomFieldRepositoryProtocol.CreateParams
  ): Promise<TransactionCustomFieldModel> {
    const customFieldValue = new TransactionCustomFieldValueModel({
      transaction_id: data.transaction_id,
      custom_field_id: data.custom_field_id,
      value: data.value,
      user_id: data.user_id,
    });

    const savedCustomFieldValue = await customFieldValue.save();
    return savedCustomFieldValue;
  }

  async findByTransactionId(
    data: TransactionCustomFieldRepositoryProtocol.FindByTransactionIdParams
  ): Promise<TransactionCustomFieldModel[]> {
    const query: any = { transaction_id: data.transaction_id };
    if (data.user_id) {
      query.user_id = data.user_id;
    }

    const customFieldValues =
      await TransactionCustomFieldValueModel.find(query).lean();

    return customFieldValues;
  }

  async deleteByTransactionId(
    data: TransactionCustomFieldRepositoryProtocol.DeleteByTransactionIdParams
  ): Promise<void> {
    const query: any = { transaction_id: data.transaction_id };
    if (data.user_id) {
      query.user_id = data.user_id;
    }

    const result = await TransactionCustomFieldValueModel.deleteMany(query);

    if (result.deletedCount === 0) {
      console.warn(
        `Nenhum valor de campo customizado encontrado para transaction_id ${data.transaction_id}`
      );
    }
  }
}
