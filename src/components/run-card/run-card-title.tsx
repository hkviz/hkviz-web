import { useAction, useSubmission } from '@solidjs/router';
import { Component, createEffect, onCleanup, Show } from 'solid-js';
import { TextField, TextFieldTextArea } from '~/components/ui/text-field.tsx';
import { showToast } from '~/components/ui/toast.tsx';
import { createMutableMemo } from '~/lib/create-mutable-memo.ts';
import { cleanupRunTitle, MAX_RUN_TITLE_LENGTH } from '~/lib/types/run-fields.ts';
import type { RunMetadata } from '~/server/run/_find_runs_internal.ts';
import { runSetTitleAction } from '~/server/run/run-set-title.ts';

export const RunCardTitle: Component<{ run: RunMetadata; isOwnRun: boolean }> = (props) => {
	const [title, setTitle] = createMutableMemo(() => props.run.title);
	createEffect(() => {
		setTitle(props.run.title);
	});

	const setTitleAction = useAction(runSetTitleAction);
	const titleSubmission = useSubmission(runSetTitleAction, ([input]) => input.id === props.run.id);

	// oxlint-disable-next-line no-unassigned-vars
	let textareaRef!: HTMLTextAreaElement;

	const updateInputSize = () => {
		if (textareaRef) {
			textareaRef.style.width = `min(${Math.max(textareaRef.value.length * 1.5 + 5, 10)}ch, 100%)`;
			textareaRef.style.height = 'auto';
			textareaRef.style.height = textareaRef.scrollHeight + 'px';
		}
	};

	createEffect(() => {
		if (!textareaRef) return;
		textareaRef.value = props.run.title ?? '';
		updateInputSize();
	});

	const handleTitleChange = (_e: InputEvent) => {
		textareaRef.value = cleanupRunTitle(textareaRef.value, true);
		updateInputSize();
	};

	const handleInputBlur = async () => {
		if (!textareaRef) return;

		const newTitle = cleanupRunTitle(textareaRef.value);
		if ((title() ?? '') === (newTitle ?? '')) return;
		setTitle(newTitle);
		try {
			const _result = await setTitleAction({ id: props.run.id, title: newTitle });
			showToast({
				title: 'Successfully updated title',
			});
		} catch (ex) {
			showToast({
				title: 'Failed to update title',
				description: (ex as Error)?.message,
			});
		}
	};

	createEffect(() => {
		if (!textareaRef) return;
		const resizeObserver = new ResizeObserver(updateInputSize);

		resizeObserver.observe(textareaRef);

		onCleanup(() => {
			resizeObserver.disconnect();
		});
	});

	return (
		<>
			<Show when={props.isOwnRun}>
				<TextField>
					<TextFieldTextArea
						ref={textareaRef}
						placeholder="Add title"
						rows={1}
						onInput={handleTitleChange}
						onBlur={handleInputBlur}
						maxLength={MAX_RUN_TITLE_LENGTH}
						disabled={titleSubmission.pending}
						class={
							'max-w-auto relative z-8 -mx-3 -my-3 inline-block min-h-min w-full max-w-full resize-none overflow-hidden border-none bg-transparent font-serif text-xl font-bold drop-shadow-xs focus:bg-background focus:text-foreground md:text-2xl'
						}
					>
						{title()}
					</TextFieldTextArea>
				</TextField>
			</Show>
			<Show when={!props.isOwnRun && props.run.title}>
				<h2 class="color-white relative z-5 font-serif text-xl font-bold drop-shadow-xs md:text-2xl">
					{props.run.title}
				</h2>
			</Show>
		</>
	);
};
