"use client";

import React, { useEffect, useState } from "react";
import SellerDashboardLayout from "../../components/SellerDashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, Row, Col } from "react-bootstrap";
import { FaBoxOpen, FaEye, FaEnvelope } from "react-icons/fa";
import TopProducts from "@/components/products/TopProducts";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Stats = {
  totalAds: number;
  totalViews: number;
  totalMessages: number;
};

type DailyView = {
  date: string;
  views: number;
};

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({
    totalAds: 0,
    totalViews: 0,
    totalMessages: 0,
  });

  const [dailyViews, setDailyViews] = useState<DailyView[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("daily");

  // Redirect if not logged in
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Fetch stats
  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/seller/stats?sellerId=${session.user.id}`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [session?.user?.id]);

  // Fetch views based on range
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchViews = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/seller/daily-views?sellerId=${session.user.id}&range=${range}`
        );
        const data: DailyView[] = await res.json();

        // Format date nicely for display
        const formattedData = data.map((item) => {
          let displayDate = item.date;

          if (range === "daily") {
            const d = new Date(item.date);
            displayDate = `${d.getDate()}/${d.getMonth() + 1}`; // e.g., 22/3
          } else if (range === "monthly") {
            const [year, month] = item.date.split("-");
            displayDate = `${new Date(+year, +month - 1).toLocaleString("default", {
              month: "short",
            })} ${year}`;
          }
          // weekly can stay as "Week 1", "Week 2", etc.

          return { ...item, date: displayDate };
        });

        setDailyViews(formattedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchViews();
  }, [session?.user?.id, range]);

  return (
    <SellerDashboardLayout>
      <div className="container-fluid">

        {/* HEADER */}
        <div className="mb-4">
          <h2 className="fw-bold">Dashboard Overview</h2>
          <p className="text-muted">
            Welcome back, {session?.user?.name || "Seller"} 👋
          </p>
        </div>

        {/* STATS */}
        <Row className="g-4">
          <Col md={4}>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="d-flex align-items-center gap-3">
                <FaBoxOpen size={30} className="text-primary" />
                <div>
                  <h6 className="text-muted">Ads Posted</h6>
                  <h4>{stats.totalAds}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="d-flex align-items-center gap-3">
                <FaEye size={30} className="text-success" />
                <div>
                  <h6 className="text-muted">Total Views</h6>
                  <h4>{stats.totalViews}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="d-flex align-items-center gap-3">
                <FaEnvelope size={30} className="text-warning" />
                <div>
                  <h6 className="text-muted">Messages</h6>
                  <h4>{stats.totalMessages}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* GRAPH */}
        <Row className="mt-4">
          <Col>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">Ads Views</h5>
                  <select
                    className="form-select w-auto"
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {loading ? (
                  <p>Loading chart...</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyViews}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" angle={0} textAnchor="middle" interval={0} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#0d6efd" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* TOP 10 MOST VIEWED PRODUCTS */}
        {session?.user?.id && <TopProducts sellerId={session.user.id} />}

      </div>
    </SellerDashboardLayout>
  );
};

export default Page;