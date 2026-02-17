import { model } from "mongoose";
import { TransactionCustomFieldValueSchema } from "./TransactionCustomFieldValueSchema";

import mongoose, { Schema } from "mongoose";

export enum FieldType {
  TEXT = "text",
  NUMBER = "number",
  MULTIPLE = "multiple",
  DATE = "date",
  MONETARY = "monetary",
}

const OptionSchema = new Schema(
  {
    value: {
      type: String,
      required: true,
    },
    recordTypeIds: {
      type: [Number],
      required: true,
    },
  },
  { _id: false }
);

export const CustomFieldSchema = new Schema(
  {
    id: {
      type: String,
      default: function (this: { _id: mongoose.Types.ObjectId }) {
        return this._id.toString();
      },
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(FieldType),
      required: true,
    },
    label: {
      type: String,
      maxlength: 100,
      required: true,
    },
    description: {
      type: String,
      maxlength: 255,
      default: null,
    },
    category_id: {
      type: String,
      required: true,
    },
    record_type_id: {
      type: [Number],
      required: true,
      index: true,
    },
    name: {
      type: String,
      maxlength: 100,
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    options: [OptionSchema],
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

CustomFieldSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updated_at = new Date();
  }
  next();
});

export const CustomFieldModel = model("custom_fields", CustomFieldSchema);

export const TransactionCustomFieldValueModel = model(
  "transaction_custom_field_values",
  TransactionCustomFieldValueSchema
);
