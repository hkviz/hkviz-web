'use client';

import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '~/trpc/react';

export function UserNameSettingsOption({ currentName }: { currentName: string }) {
    const { toast } = useToast();

    const [userName, setUsername] = useState(currentName);
    const router = useRouter();

    const setUsernameMutation = api.account.setUsername.useMutation({
        onSuccess() {
            toast({ title: 'Successfully set username' });
            router.refresh();
        },
    });

    function handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
        const eventName = event.target.value;
        if (userName != eventName) {
            setUsername(event.target.value);
            setUsernameMutation.mutate({ username: eventName });
        }
    }

    return (
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h3 className="text-lg font-semibold">Player name</h3>
                <p className="text-sm text-gray-500">Choose the name, that is displayed next to your public gameplays.</p>
            </div>
            <Input defaultValue={userName} onBlur={handleUsernameChange} />
        </div>
    );
}
