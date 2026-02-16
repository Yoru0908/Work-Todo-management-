import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    username: text('username').notNull().unique(),
    displayName: text('display_name').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').notNull().default('member'),
    createdAt: text('created_at').default(new Date().toISOString()),
});

// Tasks table
export const tasks = sqliteTable('tasks', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    deadline: text('deadline'),
    requester: text('requester').default(''),
    destination: text('destination').default(''),
    type: text('type').default('その他'),
    priority: text('priority').default('中'),
    status: text('status').default('未着手'),
    assignee: text('assignee').default(''),
    notes: text('notes').default(''),
    isImportant: integer('is_important').default(0),
    // Category: task (タスク) or guide (ガイド/重点事項)
    category: text('category').default('task'),
    // Detailed content for guides (操作手順、注意点など)
    content: text('content'),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: text('created_at').default(new Date().toISOString()),
    updatedAt: text('updated_at').default(new Date().toISOString()),
});

// Subtasks table
export const subtasks = sqliteTable('subtasks', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    taskId: integer('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    status: text('status').default('未着手'),
    sortOrder: integer('sort_order').default(0),
});

// Info notes table
export const infoNotes = sqliteTable('info_notes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    taskId: integer('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    isImportant: integer('is_important').default(0),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: text('created_at').default(new Date().toISOString()),
});

// Task history table
export const taskHistory = sqliteTable('task_history', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    taskId: integer('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
    fieldName: text('field_name').notNull(),
    oldValue: text('old_value'),
    newValue: text('new_value'),
    changedBy: integer('changed_by').references(() => users.id),
    changedAt: text('changed_at').default(new Date().toISOString()),
});

// Requirement updates table
export const requirementUpdates = sqliteTable('requirement_updates', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    taskId: integer('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: text('created_at').default(new Date().toISOString()),
});

// Inventory schedules table
export const inventorySchedules = sqliteTable('inventory_schedules', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderNo: text('order_no').notNull(),
    product: text('product').notNull(),
    brand: text('brand').notNull(),
    channel: text('channel').notNull().default('Online'),
    shipmentDate: text('shipment_date'),
    eta: text('eta'),
    arrivalDate: text('arrival_date'),
    notes: text('notes').default(''),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: text('created_at').default(new Date().toISOString()),
    updatedAt: text('updated_at').default(new Date().toISOString()),
});

// SKU records table
export const skuRecords = sqliteTable('sku_records', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    orderNo: text('order_no').notNull(),
    skuCode: text('sku_code').notNull(),
    product: text('product').notNull(),
    brand: text('brand').notNull(),
    color: text('color').default(''),
    quantity: integer('quantity').default(1),
    channel: text('channel').notNull().default('Online'),
    status: text('status').default('pending'),
    notes: text('notes').default(''),
    createdBy: integer('created_by').references(() => users.id),
    createdAt: text('created_at').default(new Date().toISOString()),
    updatedAt: text('updated_at').default(new Date().toISOString()),
});
