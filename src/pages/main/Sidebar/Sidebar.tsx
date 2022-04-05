import React from "react";
import addIcon from "../../../assets/add-solid.svg";
import diskIcon from "../../../assets/drive.svg";
import ProgressBar from "../../../components/ProgressBar";
import Entry from "./Entry";
import {Button, Container, Explorer, Icon, ProgressText, Storage, Text} from "./Sidebar.styles";

const Sidebar = () => {
	const MAX_CAPACITY = 1000; // MB
	const percent = 34;

	return (
		<Container>
			<Button>
				<Icon src={addIcon}/>
				<Text>Add</Text>
			</Button>

			<Explorer>
				<Entry icon={diskIcon} text="Test" hasChildren={true}>
					<Entry icon={diskIcon} text="Sub entry #1" depth={1}/>
					<Entry icon={diskIcon} text="Sub entry #2" depth={1} hasChildren={true}>
						<Entry icon={diskIcon} text="Sub Sub entry sdasdad" depth={2}/>
					</Entry>
				</Entry>
			</Explorer>

			<Storage>
				<ProgressBar fillPercent={percent}/>
				<ProgressText>{MAX_CAPACITY * percent / 100}MB of {MAX_CAPACITY / 1000}GB used</ProgressText>
			</Storage>
		</Container>
	);
};

export default Sidebar;