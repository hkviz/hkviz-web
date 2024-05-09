import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export function GET() {
    revalidatePath(`/user-study/**`);
    redirect(`/user-study/participate/time-slot`);
}
