export type ApiResponse<T = void> = T extends void
	? void extends T
		? { success: true } | { success: false; message: string }
		: never
	: { success: true; data: T } | { success: false; message: string };
