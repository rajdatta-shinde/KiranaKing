import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, MapPinIcon, PhoneIcon, TruckIcon, XCircleIcon } from "lucide-react";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import OrderTimeLine from "../components/OrderTracking/OrderTimeLine";
import OrderOTP from "../components/OrderTracking/OrderOTP";
import LiveMap from "../components/OrderTracking/LiveMap";
import { cancelOrder, getLiveLocation, getOrderById } from "../services/orders";
import { statusColors } from "../assets/assets";
import { formatPrice, orderRef } from "../utils/format";
import { productImage } from "../utils/image";
import type { Order } from "../types";

const CANCELLABLE = ["Placed", "Confirmed"];
const LIVE_STATUSES = ["Assigned", "Packed", "Out for Delivery"];

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setOrder(undefined);
    if (!id) {
      setOrder(null);
      return;
    }
    getOrderById(id).then((o) => {
      if (!cancelled) setOrder(o);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Poll the partner's live GPS location while the order is en route.
  useEffect(() => {
    if (!order || !id || !LIVE_STATUSES.includes(order.status)) return;
    let cancelled = false;
    const poll = async () => {
      const loc = await getLiveLocation(id).catch(() => null);
      if (!cancelled && loc) setLiveLocation(loc);
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [order, id]);

  if (order === undefined) return <Loading label="Loading order..." />;

  if (order === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-lg font-semibold text-app-green">Order not found</p>
        <Link to="/orders" className="mt-3 inline-block text-app-orange font-medium">
          ← Back to my orders
        </Link>
      </div>
    );
  }

  const handleCancel = async () => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      const updated = await cancelOrder(order._id);
      setOrder(updated);
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel order");
    }
  };

  const partner = order.deliveryPartner;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate("/orders")} className="flex items-center gap-1.5 text-sm text-app-text-light hover:text-app-green mb-5">
        <ArrowLeftIcon className="size-4" /> Back to orders
      </button>

      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-app-green font-mono">{orderRef(order)}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || "bg-zinc-100 text-zinc-600"}`}>
            {order.status}
          </span>
        </div>
        {CANCELLABLE.includes(order.status) && (
          <button onClick={handleCancel} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-app-error bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
            <XCircleIcon className="size-4" /> Cancel Order
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: timeline + map + otp */}
        <div className="lg:col-span-2 space-y-6">
          <OrderOTP order={order} />
          <LiveMap order={order} liveLocation={liveLocation} />
          <OrderTimeLine order={order} />
        </div>

        {/* Right: details */}
        <div className="space-y-6">
          {partner && (
            <div className="bg-white rounded-2xl p-5 border border-app-border">
              <h2 className="text-sm font-semibold text-app-green mb-3 flex items-center gap-2">
                <TruckIcon className="size-4" /> Delivery Partner
              </h2>
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-app-green flex-center text-white font-semibold">
                  {partner.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-app-text">{partner.name}</p>
                  <p className="text-xs text-app-text-light flex items-center gap-1 capitalize">
                    <PhoneIcon className="size-3" /> {partner.phone} • {partner.vehicleType}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-app-border">
            <h2 className="text-sm font-semibold text-app-green mb-3 flex items-center gap-2">
              <MapPinIcon className="size-4" /> Delivery Address
            </h2>
            <p className="text-sm text-app-text-light">
              {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zip}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-app-border">
            <h2 className="text-sm font-semibold text-app-green mb-3">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={productImage(item.image, item.name)} alt={item.name} className="size-10 rounded-lg object-contain bg-app-cream p-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-app-text line-clamp-1">{item.name}</p>
                    <p className="text-xs text-app-text-light">Qty {item.quantity} • {item.unit}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-app-border space-y-1.5 text-sm">
              <div className="flex justify-between text-app-text-light">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-app-text-light">
                <span>Delivery</span>
                <span>{order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-app-text-light">
                <span>Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-app-green pt-2 border-t border-app-border">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
