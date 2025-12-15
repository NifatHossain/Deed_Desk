import React from "react";
import { NavLink } from "react-router-dom";

const linkBase =
	"rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

const navLinkClassName = ({ isActive }) =>
	[
		linkBase,
		isActive
			? "bg-slate-900 text-white"
			: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
	].join(" ");

const Navbar = () => {
	return (
		<header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
			<nav
				className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
				aria-label="Primary"
			>
				<div className="flex items-center justify-between">
					<NavLink
						to="/"
						className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-base font-semibold text-slate-900 hover:bg-slate-100"
					>
						<span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
							D
						</span>
						<span>DeedDesk</span>
					</NavLink>

					<div className="sm:hidden">
						<span className="text-xs text-slate-500">
							আপলোড • সারাংশ • নতুন দলিল
						</span>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<NavLink to="/" className={navLinkClassName}>
						হোম
					</NavLink>

					<NavLink to="/upload" className={navLinkClassName}>
						দলিল আপলোড
					</NavLink>

					<NavLink to="/summarize" className={navLinkClassName}>
						সারাংশ
					</NavLink>

					<NavLink
						to="/generate"
						className={() =>
							[
								linkBase,
								"bg-slate-900 text-white hover:bg-slate-800",
							].join(" ")
						}
					>
						নতুন দলিল তৈরি
					</NavLink>
				</div>
			</nav>
		</header>
	);
};

export default Navbar;