import { db } from "@/lib/db";
import { serviceCategories, serviceProviders } from "@/lib/schema";
import { asc, count, eq } from "drizzle-orm";
import {
  createCategory,
  updateCategory,
  toggleCategoryActive,
  deleteCategory,
} from "@/actions/admin-category-actions";
import { CategoryCreateForm } from "@/components/admin/category-create-form";

export default async function AdminCategoriesPage() {
  const categories = await db
    .select()
    .from(serviceCategories)
    .orderBy(asc(serviceCategories.order));

  const usage = await db
    .select({
      categoryId: serviceProviders.categoryId,
      c: count(),
    })
    .from(serviceProviders)
    .groupBy(serviceProviders.categoryId);

  const usageMap = new Map(usage.map((u) => [u.categoryId, Number(u.c)]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Service Categories</h1>
        <p className="text-gray-600 mt-1">
          Categories shown on the public services page.
        </p>
      </header>

      <section className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Add category</h2>
        <CategoryCreateForm action={createCategory} />
      </section>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Order</th>
              <th className="text-left p-3 font-medium">Icon</th>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Slug</th>
              <th className="text-left p-3 font-medium">Providers</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b last:border-b-0 align-top">
                <td className="p-3 w-16">
                  <form action={updateCategory} className="flex flex-col gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="slug" value={c.slug} />
                    <input type="hidden" name="name" value={c.name} />
                    <input type="hidden" name="icon" value={c.icon ?? ""} />
                    <input
                      type="hidden"
                      name="description"
                      value={c.description ?? ""}
                    />
                    <input
                      name="order"
                      type="number"
                      defaultValue={c.order}
                      className="border rounded px-2 py-1 w-14 text-xs"
                    />
                    <button
                      type="submit"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Save
                    </button>
                  </form>
                </td>
                <td className="p-3 text-2xl">{c.icon}</td>
                <td className="p-3">
                  <div className="font-medium">{c.name}</div>
                  {c.description && (
                    <div className="text-xs text-gray-500 max-w-xs">
                      {c.description}
                    </div>
                  )}
                </td>
                <td className="p-3 font-mono text-xs text-gray-500">{c.slug}</td>
                <td className="p-3">{usageMap.get(c.id) ?? 0}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      c.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {c.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="p-3 text-right space-x-3 whitespace-nowrap">
                  <form action={toggleCategoryActive} className="inline">
                    <input type="hidden" name="id" value={c.id} />
                    <button className="text-xs text-gray-600 hover:underline">
                      {c.isActive ? "Hide" : "Show"}
                    </button>
                  </form>
                  {(usageMap.get(c.id) ?? 0) === 0 && (
                    <form action={deleteCategory} className="inline">
                      <input type="hidden" name="id" value={c.id} />
                      <button className="text-xs text-red-600 hover:underline">
                        Delete
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}