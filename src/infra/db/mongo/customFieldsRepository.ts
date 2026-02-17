import {
  CustomFieldModel,
  Option,
} from "@/domain/models/mongo/CustomFieldModel";
import { CustomFieldsRepositoryProtocol } from "@/infra/db/interfaces/customFieldsRepositoryProtocol";
import { CustomFieldModel as CustomField } from "@/domain/entities/mongo/CustomFieldsSchema";
import { NotFoundError } from "@/data/errors/NotFoundError";

export class CustomFieldsRepository implements CustomFieldsRepositoryProtocol {
  async create(
    data: CustomFieldsRepositoryProtocol.CreateCustomFieldParams
  ): Promise<CustomFieldModel> {
    const customField = new CustomField({
      type: data.type,
      label: data.label,
      name: data.name,
      category_id: data.category_id,
      user_id: data.user_id,
      description: data.description,
      options: data.options,
      record_type_id: data.record_type_id,
      required: data.required ?? false,
    });

    const savedCustomField = await customField.save();
    return savedCustomField;
  }

  async findByNameAndUserId(
    data: CustomFieldsRepositoryProtocol.findByNameAndUserIdParams
  ): Promise<CustomFieldModel | null> {
    const customField = await CustomField.findOne({
      name: data.name,
      user_id: data.user_id,
    });

    if (!customField) return null;

    return customField;
  }

  async findByRecordTypeId(
    data: CustomFieldsRepositoryProtocol.findByRecordTypeIdParams
  ): Promise<{ customFields: CustomFieldModel[]; total: number }> {
    const customFields = await CustomField.find({
      record_type_id: data.record_type_id,
      category_id: data.category_id,
      user_id: data.user_id,
    }).lean();

    return { customFields, total: customFields.length };
  }
  async findByUserId(
    data: CustomFieldsRepositoryProtocol.findByUserIdParams
  ): Promise<{ customFields: CustomFieldModel[]; total: number }> {
    const page = data.page || 1;
    const limit = data.limit || 10;
    const search = data.search || "";
    const sortBy = data.sortBy || "label";
    const order = data.order === "DESC" ? -1 : 1;

    const whereCondition: any = { user_id: data.user_id };

    if (search) {
      whereCondition.label = { $regex: search, $options: "i" };
    }

    const total = await CustomField.countDocuments(whereCondition);

    const customFields = await CustomField.find(whereCondition)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return { customFields, total };
  }

  async findByIdsAndUserId(
    data: CustomFieldsRepositoryProtocol.FindByIdsAndUserIdParams
  ): Promise<CustomFieldModel[] | null> {
    if (!data.ids || data.ids.length === 0) {
      return [];
    }

    const customFields = await CustomField.find({
      _id: { $in: data.ids },
      user_id: data.user_id,
    }).lean();

    if (customFields.length !== data.ids.length) {
      console.warn(
        `Nem todos os custom fields foram encontrados para userId ${data.user_id}`
      );
    }

    return customFields;
  }
  async findByIdAndUserId(
    data: CustomFieldsRepositoryProtocol.FindByIdAndUserIdParams
  ): Promise<CustomFieldModel | null> {
    const customField = await CustomField.findOne({
      _id: data.id,
      user_id: data.user_id,
    });

    if (!customField) return null;

    return customField;
  }

  async update(
    data: CustomFieldsRepositoryProtocol.UpdateParams
  ): Promise<CustomFieldModel> {
    const customField = await CustomField.findOne({
      _id: data.id,
      user_id: data.user_id,
    });

    if (!customField) {
      throw new NotFoundError(
        `Campo personalizado com ID ${data.id} não encontrado para este usuário`
      );
    }

    if (data.type !== undefined) customField.type = data.type;
    if (data.label !== undefined) customField.label = data.label;
    if (data.name !== undefined) customField.name = data.name;
    if (data.category_id !== undefined)
      customField.category_id = data.category_id;
    if (data.description !== undefined && data.description !== null)
      customField.description = data.description;
    if (data.options !== undefined) customField.options = data.options as any;
    if (data.record_type_id !== undefined)
      customField.record_type_id = data.record_type_id;
    if (data.required !== undefined) customField.required = data.required;

    const updatedCustomField = await customField.save();
    return updatedCustomField;
  }

  async delete(
    data: CustomFieldsRepositoryProtocol.DeleteParams
  ): Promise<void> {
    const result = await CustomField.deleteOne({
      _id: data.id,
      user_id: data.user_id,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundError(
        `Campo personalizado com ID ${data.id} não encontrado para este usuário`
      );
    }
  }
}
