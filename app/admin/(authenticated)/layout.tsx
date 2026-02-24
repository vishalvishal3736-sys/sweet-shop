import AdminLayout from '@/components/AdminLayout';

export default function AuthenticatedAdminLayout({ children }: { children: React.ReactNode }) {
    return <AdminLayout>{children}</AdminLayout>;
}
