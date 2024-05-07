'use server';

import { revalidatePath } from 'next/cache';

// eslint-disable-next-line @typescript-eslint/require-await
export async function revalidatePathFromClient(tags: string[]): Promise<void> {
    tags.forEach((tag) => {
        revalidatePath(tag);
    });
}
