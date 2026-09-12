import { TransactionCustomFieldValueModel } from "@/domain/entities/mongo/TransactionCustomFieldValueSchema";
import { TransactionCustomFieldRepositoryProtocol } from "../interfaces/TransactionCustomFieldRepositoryProtocol";
import { TransactionCustomFieldValueModel as TransactionCustomFieldModel } from "@/domain/models/mongo/TransactionCustomFieldValueModel";
import mongoose from "mongoose";

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

  async replaceByTransactionId(
    data: TransactionCustomFieldRepositoryProtocol.ReplaceByTransactionIdParams
  ): Promise<TransactionCustomFieldModel[]> {
    const ownerFilter = {
      transaction_id: data.transaction_id,
      user_id: data.user_id,
    };

    if (data.values.length === 0) {
      await TransactionCustomFieldValueModel.deleteMany(ownerFilter);
      return [];
    }

    const now = new Date();
    await TransactionCustomFieldValueModel.bulkWrite(
      data.values.map((field) => ({
        updateOne: {
          filter: {
            ...ownerFilter,
            custom_field_id: field.custom_field_id,
          },
          update: {
            $set: {
              value: field.value,
              updated_at: now,
            },
            $setOnInsert: {
              id: new mongoose.Types.ObjectId().toString(),
              transaction_id: data.transaction_id,
              custom_field_id: field.custom_field_id,
              user_id: data.user_id,
              created_at: now,
            },
          },
          upsert: true,
        },
      })),
      { ordered: true }
    );

    // Os valores antigos só são removidos depois que todos os novos foram
    // persistidos. Assim, uma falha no upsert não deixa a transação sem dados.
    await TransactionCustomFieldValueModel.deleteMany({
      ...ownerFilter,
      custom_field_id: {
        $nin: data.values.map((field) => field.custom_field_id),
      },
    });

    return this.findByTransactionId(ownerFilter);
  }

  async deleteByTransactionIds(
    data: TransactionCustomFieldRepositoryProtocol.DeleteByTransactionIdsParams
  ): Promise<void> {
    if (data.transaction_ids.length === 0) return;

    await TransactionCustomFieldValueModel.deleteMany({
      transaction_id: { $in: data.transaction_ids },
      user_id: data.user_id,
    });
  }

  async deleteByCustomFieldIds(
    data: TransactionCustomFieldRepositoryProtocol.DeleteByCustomFieldIdsParams
  ): Promise<void> {
    if (data.custom_field_ids.length === 0) return;

    await TransactionCustomFieldValueModel.deleteMany({
      custom_field_id: { $in: data.custom_field_ids },
      user_id: data.user_id,
    });
  }

  async deleteByUserId(
    data: TransactionCustomFieldRepositoryProtocol.DeleteByUserIdParams
  ): Promise<void> {
    await TransactionCustomFieldValueModel.deleteMany({
      user_id: data.user_id,
    });
  }
}
