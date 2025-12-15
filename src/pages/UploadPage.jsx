import React, { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_ENDPOINT = "/api/deeds/upload";

const UploadPage = () => {
	const fileInputRef = useRef(null);
	const [files, setFiles] = useState([]);
	const [isUploading, setIsUploading] = useState(false);
	const [responseJson, setResponseJson] = useState(null);
	const [errorMessage, setErrorMessage] = useState("");

	const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
	const uploadEndpoint = (import.meta.env.VITE_UPLOAD_ENDPOINT ?? DEFAULT_ENDPOINT).trim();
	const uploadUrl = useMemo(() => {
		if (!apiBaseUrl) return uploadEndpoint;
		return `${apiBaseUrl.replace(/\/$/, "")}${uploadEndpoint.startsWith("/") ? "" : "/"}${uploadEndpoint}`;
	}, [apiBaseUrl, uploadEndpoint]);

	const previews = useMemo(() => {
		return files.map((file) => ({
			id: `${file.name}-${file.size}-${file.lastModified}`,
			name: file.name,
			size: file.size,
			type: file.type,
			url: URL.createObjectURL(file),
		}));
	}, [files]);

	useEffect(() => {
		return () => {
			for (const preview of previews) {
				URL.revokeObjectURL(preview.url);
			}
		};
	}, [previews]);

	const onPickFiles = (event) => {
		setErrorMessage("");
		setResponseJson(null);

		const picked = Array.from(event.target.files ?? []).filter((f) =>
			f.type?.startsWith("image/")
		);
		if (picked.length === 0) return;
		setFiles((prev) => [...prev, ...picked]);
		// allow selecting the same file again later
		event.target.value = "";
	};

	const removeFileByIndex = (index) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const clearAll = () => {
		setFiles([]);
		setResponseJson(null);
		setErrorMessage("");
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const formatBytes = (bytes) => {
		if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
		const units = ["B", "KB", "MB", "GB"];
		let value = bytes;
		let unitIndex = 0;
		while (value >= 1024 && unitIndex < units.length - 1) {
			value /= 1024;
			unitIndex += 1;
		}
		return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
	};

	const onUpload = async () => {
		setErrorMessage("");
		setResponseJson(null);

		if (files.length === 0) {
			setErrorMessage("অনুগ্রহ করে অন্তত একটি ছবি নির্বাচন করুন।");
			return;
		}

		setIsUploading(true);
		try {
			const formData = new FormData();
			for (const file of files) {
				formData.append("files", file);
			}

			const res = await fetch(uploadUrl, {
				method: "POST",
				body: formData,
			});

			const contentType = res.headers.get("content-type") ?? "";
			const isJson = contentType.includes("application/json");
			const payload = isJson ? await res.json() : await res.text();

			if (!res.ok) {
				const messageFromServer =
					isJson && payload && typeof payload === "object"
						? (payload.message ?? payload.error ?? "")
						: "";
				throw new Error(
					messageFromServer || `সার্ভার রিকোয়েস্ট ব্যর্থ হয়েছে (HTTP ${res.status})।`
				);
			}

			setResponseJson(payload);
		} catch (err) {
			setErrorMessage(err instanceof Error ? err.message : "অপ্রত্যাশিত ত্রুটি হয়েছে।");
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
					দলিলের ছবি আপলোড
				</h1>
				<p className="text-sm leading-6 text-slate-600">
					একসাথে একাধিক ছবি নির্বাচন করে সার্ভারে পাঠান।
				</p>
			</div>

			<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<div className="text-sm font-semibold text-slate-900">ছবি নির্বাচন</div>
						<p className="mt-1 text-sm text-slate-600">
							শুধুমাত্র ইমেজ ফাইল (JPG/PNG/WebP) সমর্থিত।
						</p>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row">
						<button
							type="button"
							className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
							onClick={() => fileInputRef.current?.click()}
							disabled={isUploading}
						>
							ফাইল নির্বাচন করুন
						</button>
						<button
							type="button"
							className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
							onClick={onUpload}
							disabled={isUploading || files.length === 0}
						>
							{isUploading ? "আপলোড হচ্ছে…" : "সার্ভারে পাঠান"}
						</button>
						<button
							type="button"
							className="inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-60"
							onClick={clearAll}
							disabled={isUploading && files.length === 0}
						>
							সব মুছুন
						</button>
					</div>
				</div>

				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					multiple
					onChange={onPickFiles}
					className="sr-only"
				/>

				<div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
					<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
						<div className="text-sm font-medium text-slate-900">API URL</div>
						<div className="text-xs text-slate-600">
							`VITE_API_BASE_URL` এবং/অথবা `VITE_UPLOAD_ENDPOINT` দিয়ে কনফিগার করা যায়
						</div>
					</div>
					<div className="mt-2 break-all rounded-lg bg-white px-3 py-2 text-sm text-slate-700">
						{uploadUrl}
					</div>
				</div>

				{errorMessage ? (
					<div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
						{errorMessage}
					</div>
				) : null}
			</div>

			<div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
					<div className="flex items-center justify-between">
						<div className="text-sm font-semibold text-slate-900">
							নির্বাচিত ছবি ({files.length})
						</div>
						<div className="text-xs text-slate-500">
							মোট: {formatBytes(files.reduce((acc, f) => acc + f.size, 0))}
						</div>
					</div>

					{files.length === 0 ? (
						<div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
							এখনো কোনো ছবি যোগ করা হয়নি। উপরে “ফাইল নির্বাচন করুন” চাপুন।
						</div>
					) : (
						<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
							{previews.map((p, index) => (
								<div key={p.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white">
									<img
										src={p.url}
										alt={p.name}
										className="h-28 w-full object-cover"
									/>
									<div className="p-2">
										<div className="line-clamp-1 text-xs font-medium text-slate-900">
											{p.name}
										</div>
										<div className="mt-0.5 text-xs text-slate-500">
											{formatBytes(p.size)}
										</div>
									</div>
									<button
										type="button"
										onClick={() => removeFileByIndex(index)}
										disabled={isUploading}
										className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100 disabled:opacity-50"
									>
										মুছুন
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
					<div className="text-sm font-semibold text-slate-900">রেসপন্স</div>
					<p className="mt-1 text-sm text-slate-600">
						সার্ভার থেকে যে ফলাফল আসবে তা এখানে দেখাবে (JSON)।
					</p>

					{responseJson == null ? (
						<div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
							আপলোড করার পরে ফলাফল দেখা যাবে।
						</div>
					) : (
						<pre className="mt-4 max-h-[360px] overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-100">
							{typeof responseJson === "string"
								? responseJson
								: JSON.stringify(responseJson, null, 2)}
						</pre>
					)}
				</div>
			</div>
		</div>
	);
};

export default UploadPage;