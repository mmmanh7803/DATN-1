"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ReactNode, useEffect, useState } from "react";
import { getActivityById, ActivityDto } from "@/lib/services/activityService";

interface ActivityPageLayoutProps {
  activityId: string;
  topicId: number;
  topicTitle: string;
  loading: boolean;
  error: string | null;
  sidebar: ReactNode;
  children: ReactNode;
}

export default function ActivityPageLayout({
  activityId,
  topicId,
  topicTitle,
  loading,
  error,
  sidebar,
  children,
}: ActivityPageLayoutProps) {
  const [activity, setActivity] = useState<ActivityDto | null>(null);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        setActivityLoading(true);
        const activityData = await getActivityById(activityId);
        setActivity(activityData);
      } catch (error) {
        console.error("Lỗi khi tải thông tin activity:", error);
        // Fallback nếu không load được từ database
      } finally {
        setActivityLoading(false);
      }
    };

    if (activityId) {
      loadActivity();
    }
  }, [activityId]);

  const activityTitle = activity?.displayName || activity?.name || "Hoạt Động Học Tập";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
            <div className="container mx-auto px-4">
              <Link
                href={`/topics/${topicId}`}
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại chủ đề
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {activityTitle}
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
            <div className="container mx-auto px-4">
              <Link
                href={`/topics/${topicId}`}
                className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại chủ đề
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {activityTitle}
              </h1>
            </div>
          </section>
          <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-xl text-gray-600 mb-4">{error}</p>
              <Link
                href={`/topics/${topicId}`}
                className="text-primary hover:text-primary-dark underline"
              >
                Quay lại chủ đề
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Link
              href={`/topics/${topicId}`}
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại chủ đề
            </Link>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {activityTitle}
                </h1>
                <p className="text-xl text-white/90">
                  {topicTitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              {children}
            </div>

            {/* Right Sidebar - Activities */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                {sidebar}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

