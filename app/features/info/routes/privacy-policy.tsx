import type { MetaFunction } from "react-router";
import { Main } from "~/components/Main";
import { metaTags } from "~/utils/remix";

export const meta: MetaFunction = (args) => {
	return metaTags({
		title: "Privacy Policy",
		location: args.location,
	});
};

export default function PrivacyPolicyPage() {
	return (
		<Main>
			<div data-fuse-privacy-tool style={{ fontSize: "0.5rem" }} />
		</Main>
	);
}
