import { useState } from "react";
import { Toast } from 'antd-mobile';

// ----------------------------------------------------------------------

type CopiedValue = string | null;

type CopyFn = (text: string | null | undefined) => Promise<boolean>;

type ReturnType = {
	copyFn: CopyFn;
	copiedText: CopiedValue;
};

// 检查文本是否为有效值的工具函数
const isValidText = (text: string | null | undefined): text is string => {
	return text !== null && text !== undefined && text !== '' && text.trim() !== '';
};

export const useCopyToClipboard = (): ReturnType => {
	const [copiedText, setCopiedText] = useState<CopiedValue>(null);

	const copyFn: CopyFn = async (text) => {
		// 检查文本是否为有效值
		if (!isValidText(text)) {
			Toast.show({
				icon: 'fail',
				content: 'Copy failed: invalid text',
			});
			setCopiedText(null);
			return false;
		}

		if (!navigator?.clipboard) {
			Toast.show({
				icon: 'fail',
				content: 'Clipboard not supported',
			});
			return false;
		}

		try {
			await navigator.clipboard.writeText(text);
			setCopiedText(text);
			Toast.show({
                icon: 'success',
                content: 'Success!',
            })
			
			return true;
		} catch (error) {
			console.warn("Copy failed", error);
			Toast.show({
				icon: 'fail',
				content: 'Copy failed',
			});
			setCopiedText(null);
			return false;
		}
	};

	return { copiedText, copyFn };
}
