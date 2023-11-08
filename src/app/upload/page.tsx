import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getServerAuthSession } from '~/server/auth';
import { AuthNeeded } from '../_components/auth-needed';
import { MainContentWrapper } from '../_components/main-content-wrapper';

export default async function Upload() {
    // const hello = await api.post.hello.query({ text: "from tRPC" });
    const session = await getServerAuthSession();

    if (!session) {
        return <AuthNeeded />;
    }

    return (
        <MainContentWrapper>
            <div className="container flex flex-col items-center justify-center gap-4">
                {/* <h1 className="text-4xl font-extrabold tracking-tight">Upload a HollowKnight run</h1> */}
                <Card className="w-[600px] max-w-[calc(100%-2rem)]">
                    <CardHeader>
                        <CardTitle>Upload a HollowKnight run</CardTitle>
                        <CardDescription>Deploy your new project in one-click.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form>
                            <div className="grid w-full items-center gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="run-file">Run file</Label>
                                    <Input id="run-file" type="file" accept=".hkrun" />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="framework">
                                        How much HollowKnight did you play before this run?
                                    </Label>
                                    <Select>
                                        <SelectTrigger id="played before">
                                            <SelectValue placeholder="Previous HollowKnight experience" />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectItem value="none">
                                                I didn{"'"}t - this is my first time playing HollowKnight
                                            </SelectItem>
                                            <SelectItem value="bit">
                                                A bit - I have never finished the game but I have played it
                                            </SelectItem>
                                            <SelectItem value="lot">A lot - I have finished the game before</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button>Upload</Button>
                    </CardFooter>
                </Card>
            </div>
        </MainContentWrapper>
    );
}
