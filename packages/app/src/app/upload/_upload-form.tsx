'use client';

export function UploadForm() {
    // TODO bring back

    return <div>Coming soon</div>;

    // const router = useRouter();
    // const [file, setFile] = useState<File>();
    // const [previousHollowKnightExperience, setPreviousHollowKnightExperience] = useState<
    //     'none' | 'unfinished' | 'finished' | 'finishedMany'
    // >();
    // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     if (event.target.files) {
    //         const currentFile = event.target.files[0];
    //         setFile(currentFile);
    //     }
    // };
    // const createUploadUrlMutation = api.run.createUploadUrl.useMutation({});
    // const uploadFileMutation = useMutation({
    //     mutationFn: async (options: { formData: FormData; signedUrl: string }) => {
    //         await fetch(options.signedUrl, {
    //             method: 'PUT',
    //             body: options.formData,
    //         });
    //     },
    // });
    // const isUploading = createUploadUrlMutation.isLoading || uploadFileMutation.isLoading;
    // const handleUpload = async () => {
    //     createUploadUrlMutation.reset();
    //     uploadFileMutation.reset();
    //     if (!file) return;
    //     const formData = new FormData();
    //     formData.append('file', file);
    //     const { signedUrl, id } = await createUploadUrlMutation.mutateAsync({
    //         description: 'abc',
    //         runFileId: '81f32aba-6111-4ad6-b108-99888527b7ec',
    //         previousHollowKnightExperience: previousHollowKnightExperience as never,
    //     });
    //     await uploadFileMutation.mutateAsync({ formData, signedUrl });
    //     // todo call complete upload
    //     router.push('/run/' + id);
    // };
    // return (
    //     <Card className="w-[600px] max-w-[calc(100%-2rem)]">
    //         <CardHeader>
    //             <CardTitle>Upload a Hollow Knight run</CardTitle>
    //             <CardDescription>
    //                 Upload your run to visualize it
    //                 {!!createUploadUrlMutation.error && (
    //                     <p className="text-red-600">There has been an error while preparing your run for upload</p>
    //                 )}
    //                 {!!uploadFileMutation.error && (
    //                     <p className="text-red-600">There has been an error while uploading your run</p>
    //                 )}
    //             </CardDescription>
    //         </CardHeader>
    //         <CardContent>
    //             <form>
    //                 <fieldset disabled={isUploading}>
    //                     <div className="grid w-full items-center gap-4">
    //                         <div className="flex flex-col space-y-1.5">
    //                             <Label htmlFor="run-file">Run file</Label>
    //                             <Input id="run-file" type="file" accept=".hkrun" onChange={handleFileChange} />
    //                         </div>
    //                         <div className="flex flex-col space-y-1.5">
    //                             <Label htmlFor="framework">How much Hollow Knight did you play before this run?</Label>
    //                             <Select onValueChange={(e) => setPreviousHollowKnightExperience(e as never)}>
    //                                 <SelectTrigger id="played before">
    //                                     <SelectValue placeholder="Previous Hollow Knight experience" />
    //                                 </SelectTrigger>
    //                                 <SelectContent position="popper">
    //                                     <SelectItem value="none">This is my first time playing Hollow Knight</SelectItem>
    //                                     <SelectItem value="unfinished">
    //                                         I have never finished the game but I have played it
    //                                     </SelectItem>
    //                                     <SelectItem value="finished">I have finished the game once</SelectItem>
    //                                     <SelectItem value="finishedMany">
    //                                         I played through Hollow Knight a few times
    //                                     </SelectItem>
    //                                 </SelectContent>
    //                             </Select>
    //                         </div>
    //                     </div>
    //                 </fieldset>
    //             </form>
    //         </CardContent>
    //         <CardFooter className="flex justify-end">
    //             <Button disabled={isUploading} onClick={handleUpload}>
    //                 Upload
    //             </Button>
    //         </CardFooter>
    //     </Card>
    // );
}
