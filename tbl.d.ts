declare global {
	namespace tbl{
	interface activity_list_info{
		id: number;
		type: number;
		name: string;
		parent: number;
		order: number;
		red_point: red_point_info
		banner: string;
		background: string;
		time_style: number;
		main_icon: string;
		tab_icon: string;
		tab_name: string;
	}
	interface red_point_info{
		id: number;
		name: string;
		parent: number;
		showType: number;
	}
	}
}
export { };

declare global {
	interface ITbl {
		activity_list_info: GTbl<tbl.activity_list_info>;
		red_point_info: GTbl<tbl.red_point_info>;
	}
}