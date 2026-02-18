import AdminUsersPage from "@/app/admin/users/page";

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function StaffUsersPage(props: Props) {
    return <AdminUsersPage {...props} />;
}
