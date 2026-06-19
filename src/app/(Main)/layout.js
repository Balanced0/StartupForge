import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }) {
  return <section>
    <Navbar></Navbar>
    {children}
    </section>
}