import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusIcon, EditIcon, XIcon, PackageXIcon, Trash2Icon } from "lucide-react";
import toast from "react-hot-toast";
import type { Product } from "../../types";
import Loading from "../../components/Loading";
import { getProducts, updateProduct, deleteProduct } from "../../services/products";
import { productImage } from "../../utils/image";

export default function AdminProducts() {

    const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionFor, setActionFor] = useState<Product | null>(null);
    const [working, setWorking] = useState(false);

    const fetchProducts = async () => {
        try {
            const list = await getProducts();
            setProducts(list);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleMarkOutOfStock = async () => {
        if (!actionFor) return;
        setWorking(true);
        try {
            const form = new FormData();
            form.append("stock", "0");
            await updateProduct(actionFor._id, form);
            toast.success(`"${actionFor.name}" marked out of stock`);
            setActionFor(null);
            await fetchProducts();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not update product");
        } finally {
            setWorking(false);
        }
    };

    const handleDelete = async () => {
        if (!actionFor) return;
        setWorking(true);
        try {
            await deleteProduct(actionFor._id);
            toast.success(`"${actionFor.name}" deleted permanently`);
            setActionFor(null);
            await fetchProducts();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not delete product");
        } finally {
            setWorking(false);
        }
    };

    if (loading) return <Loading />

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-app-border overflow-hidden">
                <div className="px-6 py-5 border-b border-app-border flex items-center justify-between gap-4 flex-wrap">
                    <h2 className="text-xl font-semibold text-zinc-900">Products</h2>
                    <Link to="/admin/products/new" className="flex items-center gap-2 px-4 py-2 bg-app-green text-white rounded-xl hover:bg-green-950 transition-colors font-medium text-sm">
                        <PlusIcon className="size-4" /> Add Product
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-app-cream/50 text-zinc-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-app-border">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No products found.</td>
                                </tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product._id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={productImage(product.image, product.name)} alt={product.name} className="size-12 rounded-lg object-cover" />
                                                <div>
                                                    <p className="font-semibold text-zinc-900">{product.name}</p>
                                                    <p className="text-xs text-zinc-500">{product.category || "Uncategorized"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{currency}{product.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/admin/products/${product._id}/edit`} className="p-2 text-zinc-500 hover:text-app-orange bg-zinc-100 hover:bg-orange-50 rounded-lg transition-colors">
                                                    <EditIcon className="size-4" />
                                                </Link>
                                                <button onClick={() => setActionFor(product)} title="Remove product" className="p-2 text-zinc-500 hover:text-red-600 bg-zinc-100 hover:bg-red-50 rounded-lg transition-colors">
                                                    <XIcon className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {actionFor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => !working && setActionFor(null)}>
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-app-border overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-5 border-b border-app-border flex items-center justify-between gap-4">
                            <h3 className="text-lg font-semibold text-zinc-900">Remove "{actionFor.name}"</h3>
                            <button onClick={() => !working && setActionFor(null)} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors">
                                <XIcon className="size-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-sm text-zinc-500">Choose what you'd like to do with this product.</p>
                            <button onClick={handleMarkOutOfStock} disabled={working} className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl border border-app-border hover:bg-orange-50 hover:border-app-orange transition-colors disabled:opacity-50">
                                <PackageXIcon className="size-5 text-app-orange shrink-0" />
                                <span>
                                    <span className="block font-medium text-zinc-900">Mark out of stock</span>
                                    <span className="block text-xs text-zinc-500">Hide from buyers but keep the product.</span>
                                </span>
                            </button>
                            <button onClick={handleDelete} disabled={working} className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl border border-app-border hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50">
                                <Trash2Icon className="size-5 text-red-600 shrink-0" />
                                <span>
                                    <span className="block font-medium text-zinc-900">Delete permanently</span>
                                    <span className="block text-xs text-zinc-500">Removes the product for good. Cannot be undone.</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
