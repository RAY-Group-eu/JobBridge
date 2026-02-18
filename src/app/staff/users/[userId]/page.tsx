import AdminUserDetailPage from "@/app/admin/users/[userId]/page";

type Props = {
    params: Promise<{ userId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StaffUserDetailPage(props: Props) {
    return <AdminUserDetailPage {...props} />;
}
