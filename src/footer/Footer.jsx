import React from "react";
import { NavLink } from "react-router-dom";

const linkClassName =
	"text-sm text-slate-600 hover:text-slate-900 transition-colors";

const Footer = () => {
	return (
		<footer className="border-t border-slate-200 bg-white">
			<div className="mx-auto max-w-[1280px] px-4 py-10">
				<div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
					<div className="max-w-md">
						<div className="flex items-center gap-2">
							<span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
								D
							</span>
							<div>
								<div className="text-base font-semibold text-slate-900">
									DeedDesk
								</div>
								<div className="text-sm text-slate-600">
									দলিল আপলোড করুন। সারাংশ দেখুন। নতুন খসড়া তৈরি করুন।
								</div>
							</div>
						</div>

						<p className="mt-4 text-sm leading-6 text-slate-600">
							DeedDesk আপনার দলিলের ছবি থেকে সহজবোধ্য সারাংশ তৈরি করতে এবং
							দ্রুত নতুন দলিলের খসড়া বানাতে সাহায্য করে।
						</p>
					</div>

					<div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
						<div className="space-y-3">
							<div className="text-sm font-semibold text-slate-900">সেবা</div>
							<div className="flex flex-col gap-2">
								<NavLink to="/upload" className={linkClassName}>
									দলিল আপলোড
								</NavLink>
								<NavLink to="/summarize" className={linkClassName}>
									সারাংশ
								</NavLink>
								<NavLink to="/generate" className={linkClassName}>
									নতুন দলিল তৈরি
								</NavLink>
							</div>
						</div>

						<div className="space-y-3">
							<div className="text-sm font-semibold text-slate-900">তথ্য</div>
							<div className="flex flex-col gap-2">
								<NavLink to="/" className={linkClassName}>
									হোম
								</NavLink>
								<a className={linkClassName} href="#">
									গোপনীয়তা
								</a>
								<a className={linkClassName} href="#">
									শর্তাবলী
								</a>
							</div>
						</div>

						<div className="space-y-3">
							<div className="text-sm font-semibold text-slate-900">সহায়তা</div>
							<div className="flex flex-col gap-2">
								<a className={linkClassName} href="mailto:support@deeddesk.example">
									support@deeddesk.example
								</a>
								<span className="text-sm text-slate-600">
									সোম–শুক্র, সকাল ৯টা–বিকাল ৫টা
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-xs text-slate-500">
						© {new Date().getFullYear()} DeedDesk. সর্বস্বত্ব সংরক্ষিত।
					</p>
					<p className="text-xs text-slate-500">
						তৈরিকৃত কনটেন্ট ব্যবহারের আগে আইনগত যাচাই প্রয়োজন হতে পারে।
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;