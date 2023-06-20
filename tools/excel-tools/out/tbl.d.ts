declare global {
	namespace tbl{
	interface data1{
		id: number;
		idx: number;
		str: string;
		str_array: string[];
		flag: boolean;
		bool_array: boolean[];
		norm_array: any[];
		none1: number;
		obj: any;
		boss: data2
		key_auto: any;
		none3: number;
		none4: number;
	}
	interface data2{
		id: number;
		idx: number;
		level: number;
	}
	interface data3{
		id: number;
		idx: number;
		num_array: number[];
		str: string;
		str_array: string[];
		flag: boolean;
		bool_array: boolean[];
		norm_array: any[];
		none1: number;
		obj: any;
		boss: data2
		key_auto: any;
		none3: number;
		none4: number;
	}
	}
}
export { };

declare global {
	interface ITbl {
		data1: GTbl<tbl.data1>;
		data2: GTbl<tbl.data2>;
		data3: GTbl<tbl.data3>;
	}
}