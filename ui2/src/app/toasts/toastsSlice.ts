import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {Toaster, Intent} from "@blueprintjs/core";
import {IconName, IconNames} from "@blueprintjs/icons";
const toaster = Toaster.create({
    position: "bottom-left",
    maxToasts: 5
});

const toasts = createSlice({
    initialState: {},
    name: 'toasts',
    reducers: {
        createToast(state: {}, {payload}: PayloadAction<{message: string, intent: Intent, icon: IconName}>) {
            toaster.show(payload);
            return
        },
        createErrorToast(state: {}, {payload}: PayloadAction<{message: string}>) {
            toaster.show({
                ...payload,
                intent: Intent.DANGER,
                icon: IconNames.ERROR
            });
            return
        },
        createSuccessToast(state: {}, {payload}: PayloadAction<{message: string}>) {
            toaster.show({
                ...payload,
                intent: Intent.SUCCESS,
                icon: IconNames.TICK_CIRCLE
            });
            return
        },
    }
});

export const {
    createToast,
    createErrorToast,
    createSuccessToast
} =  toasts.actions;

export {
    Intent,
    IconNames
}
export default toasts.reducer;