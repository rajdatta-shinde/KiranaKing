import { useEffect, useState } from "react";
import { PackageIcon, NavigationIcon } from "lucide-react";
import toast from "react-hot-toast";
import OtpModal from "../../components/Delivery/OtpModal";
import CancelModal from "../../components/Delivery/CancelModal";
import DeliveryOrderCard from "../../components/Delivery/DeliveryOrderCard";
import Loading from "../../components/Loading";
import type { Order } from "../../types";
import {
    getAssignedOrders,
    updateOrderStatus,
    verifyDeliveryOtp,
    updateLiveLocation,
} from "../../services/delivery";

const COMPLETED_STATUSES = ["Delivered", "Cancelled"];

export default function DeliveryDashboard() {

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"active" | "completed">("active");
    const [tracking, setTracking] = useState(false);

    // OTP modal
    const [otpModal, setOtpModal] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Cancel modal
    const [cancelModal, setCancelModal] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");

    const fetchOrders = async () => {
        try {
            setOrders(await getAssignedOrders());
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const visibleOrders = orders.filter((o) =>
        tab === "completed" ? COMPLETED_STATUSES.includes(o.status) : !COMPLETED_STATUSES.includes(o.status)
    );

    // Push live GPS to any in-transit order while location sharing is on.
    useEffect(() => {
        if (!tracking) return;
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported on this device");
            setTracking(false);
            return;
        }
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                orders
                    .filter((o) => o.status === "Out for Delivery")
                    .forEach((o) =>
                        updateLiveLocation(o._id, pos.coords.latitude, pos.coords.longitude).catch(() => undefined)
                    );
            },
            () => toast.error("Could not read your location"),
            { enableHighAccuracy: true }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [tracking, orders]);

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await updateOrderStatus(orderId, status);
            await fetchOrders();
            toast.success(`Order marked ${status}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not update status");
        }
    };

    const handleComplete = async () => {
        if (!otpModal || !otp) return;
        setSubmitting(true);
        try {
            await verifyDeliveryOtp(otpModal, otp);
            await fetchOrders();
            toast.success("Delivery confirmed!");
            setOtpModal(null);
            setOtp("");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Invalid OTP");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelModal) return;
        setSubmitting(true);
        try {
            await updateOrderStatus(cancelModal, "Cancelled", cancelReason || "Cancelled by partner");
            await fetchOrders();
            toast.success("Delivery cancelled");
            setCancelModal(null);
            setCancelReason("");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not cancel delivery");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Tabs + Tracking toggle */}
            <div className="flex items-center gap-2 flex-wrap">
                {(["active", "completed"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === t ? "bg-app-green text-white" : "bg-white text-zinc-600 hover:bg-app-cream border border-app-border"}`}>
                        {t === "active" ? "Active" : "Completed"}
                    </button>
                ))}
                <div className="ml-auto">
                    <button onClick={() => setTracking((prev) => !prev)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 ${tracking ? "bg-green-600 text-white" : "bg-white text-zinc-600 border border-app-border hover:bg-app-cream"}`}>
                        <NavigationIcon className={`w-3.5 h-3.5 ${tracking ? "animate-pulse" : ""}`} />
                        {tracking ? "Sharing Location" : "Share Location"}
                    </button>
                </div>
            </div>

            {/* Orders */}
            {loading ? (
                <Loading />
            ) : visibleOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-app-border">
                    <PackageIcon className="size-12 text-app-border mx-auto mb-3" />
                    <p className="text-lg font-semibold text-zinc-900 mb-1">No {tab} deliveries</p>
                    <p className="text-sm text-zinc-500">{tab === "active" ? "You'll see new assignments here" : "Completed deliveries will appear here"}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {visibleOrders.map((order) => <DeliveryOrderCard key={order._id} order={order} tab={tab} handleUpdateStatus={handleUpdateStatus} setOtpModal={setOtpModal} setCancelModal={setCancelModal} />)}
                </div>
            )}

            {/* OTP Modal */}
            {otpModal && <OtpModal setOtpModal={setOtpModal} otp={otp} setOtp={setOtp} handleComplete={handleComplete} submitting={submitting} />}
            {/* Cancel Modal */}
            {cancelModal && <CancelModal setCancelModal={setCancelModal} cancelReason={cancelReason} setCancelReason={setCancelReason} handleCancel={handleCancel} submitting={submitting} />}
        </div>
    );
}
