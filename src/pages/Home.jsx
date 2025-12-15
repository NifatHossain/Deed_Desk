import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
	const typeLines = useMemo(
		() => ["পরিষ্কার সারাংশ পান,", "দ্রুত নতুন খসড়া তৈরি করুন।"],
		[]
	);
	const [typedLineIndex, setTypedLineIndex] = useState(0);
	const [typedCharCount, setTypedCharCount] = useState(0);

	useEffect(() => {
		let timeoutId;

		const currentLine = typeLines[typedLineIndex] ?? "";
		const isLineComplete = typedCharCount >= currentLine.length;

		if (!isLineComplete) {
			timeoutId = window.setTimeout(() => {
				setTypedCharCount((c) => c + 1);
			}, 35);
			return () => window.clearTimeout(timeoutId);
		}

		if (typedLineIndex < typeLines.length - 1) {
			timeoutId = window.setTimeout(() => {
				setTypedLineIndex((i) => i + 1);
				setTypedCharCount(0);
			}, 450);
			return () => window.clearTimeout(timeoutId);
		}

		// finished last line → pause, then restart forever
		timeoutId = window.setTimeout(() => {
			setTypedLineIndex(0);
			setTypedCharCount(0);
		}, 1200);
		return () => window.clearTimeout(timeoutId);
	}, [typeLines, typedLineIndex, typedCharCount]);

	return (
		<div className="px-4 py-10 sm:py-14">
			<section className="mx-auto max-w-5xl">
				<div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
					<span className="inline-flex h-2 w-2 rounded-full bg-slate-900" />
					দলিলের ছবি → সারাংশ → নতুন দলিলের খসড়া
				</div>

				<h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl min-h-[150px]">
					আপনার দলিলের ছবি আপলোড করুন,
					<span className="block">
						{typeLines[0].slice(0, typedLineIndex > 0 ? typeLines[0].length : typedCharCount)}
					</span>
					<span className="block">
						{typedLineIndex > 0
							? typeLines[1].slice(0, typedCharCount)
							: ""}
					</span>
					<span className="sr-only">{typeLines.join(" ")}</span>
				</h1>

				<p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-lg">
					DeedDesk আপনার কাজকে সহজ করে: দলিলের ছবি আপলোড করুন, পড়তে সুবিধাজনক সারাংশ দেখুন, এবং প্রয়োজনমতো সম্পাদনা করার জন্য নতুন দলিলের খসড়া তৈরি করুন।
				</p>

				<div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
					<Link
						to="/upload"
						className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
					>
						দলিল আপলোড করুন
					</Link>
					<Link
						to="/summarize"
						className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
					>
						সারাংশ দেখুন
					</Link>
					<Link
						to="/generate"
						className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
					>
						নতুন দলিল তৈরি করুন
					</Link>
				</div>

				<div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
					<div className="rounded-xl border border-slate-200 bg-white p-4">
						<div className="text-sm font-semibold text-slate-900">আপলোড</div>
						<p className="mt-1 text-sm leading-6 text-slate-600">
							কাজ শুরু করতে দলিলের ছবি যুক্ত করুন।
						</p>
					</div>
					<div className="rounded-xl border border-slate-200 bg-white p-4">
						<div className="text-sm font-semibold text-slate-900">সারাংশ</div>
						<p className="mt-1 text-sm leading-6 text-slate-600">
							মূল পক্ষসমূহ, তারিখ ও শর্তগুলো সহজ ভাষায় দেখুন।
						</p>
					</div>
					<div className="rounded-xl border border-slate-200 bg-white p-4">
						<div className="text-sm font-semibold text-slate-900">তৈরি</div>
						<p className="mt-1 text-sm leading-6 text-slate-600">
							পর্যালোচনা ও সম্পাদনার জন্য নতুন দলিলের খসড়া তৈরি করুন।
						</p>
					</div>
				</div>
			</section>

			<section className="mx-auto mt-14 max-w-5xl">
				<div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
					<div className="text-sm font-semibold text-slate-900">কীভাবে কাজ করে</div>
					<div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
						<div>
							<div className="flex items-center gap-2">
								<span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
									1
								</span>
								<div className="text-sm font-medium text-slate-900">দলিলের ছবি আপলোড করুন</div>
							</div>
							<p className="mt-2 text-sm leading-6 text-slate-600">
								শুরু করতে আপনার ডকুমেন্ট DeedDesk-এ যোগ করুন।
							</p>
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
									2
								</span>
								<div className="text-sm font-medium text-slate-900">সারাংশ যাচাই করুন</div>
							</div>
							<p className="mt-2 text-sm leading-6 text-slate-600">
								নিকাশকৃত তথ্য দ্রুত যাচাই করুন।
							</p>
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
									3
								</span>
								<div className="text-sm font-medium text-slate-900">নতুন খসড়া তৈরি করুন</div>
							</div>
							<p className="mt-2 text-sm leading-6 text-slate-600">
								নতুন দলিলের খসড়া বানান, তারপর প্রয়োজনমতো ঠিক করুন।
							</p>
						</div>
					</div>

					<div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
						<p className="text-sm text-slate-600">
							নোট: ব্যবহারের আগে তৈরিকৃত আউটপুট আইনগত যাচাই প্রয়োজন হতে পারে।
						</p>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;