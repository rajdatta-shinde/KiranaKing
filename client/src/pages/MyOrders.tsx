import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PackageIcon, ChevronRightIcon } from "lucide-react";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import { getOrders } from "../services/orders";
import { statusColors } from "../assets/assets";
import { formatPrice, formatDateTime, orderRef } from "../utils/format";
import { productImage } from "../utils/image";
import type { Order } from "../types";

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOrders()
      .then((list) => {
        if (!cancelled) setOrders(list);
      })
      .catch((err) => {
        if (cancelled) return;
        toast.error(err instanceof Error ? err.message : "Failed to load orders");
        setOrders([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!orders) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-app-green mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-app-border">
          <PackageIcon className="size-12 text-app-border mx-auto mb-3" />
          <p className="font-semibold text-app-green">No orders yet</p>
          <Link to="/products" className="mt-2 inline-block text-sm text-app-orange font-medium">
            Start shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block bg-white rounded-2xl border border-app-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-app-text font-mono">{orderRef(order)}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[order.status] || "bg-zinc-100 text-zinc-600"}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-app-text-light mt-1">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 4).map((item, i) => (
                      <img
                        key={i}
                        src={productImage(item.image, item.name)}
                        alt={item.name}
                        className="size-9 rounded-full border-2 border-white object-contain bg-app-cream"
                      />
                    ))}
                    {order.items.length > 4 && (
                      <span className="size-9 rounded-full border-2 border-white bg-app-cream flex-center text-[10px] font-semibold text-app-text-light">
                        +{order.items.length - 4}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-app-green">{formatPrice(order.total)}</span>
                  <ChevronRightIcon className="size-5 text-app-text-light" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
