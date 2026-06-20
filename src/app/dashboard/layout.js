import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }) {
  return <section className="">
    <Sidebar></Sidebar>
    {children}
    </section>
}