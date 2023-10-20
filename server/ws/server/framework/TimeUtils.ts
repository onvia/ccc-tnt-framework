class TimeUtils{
    now(){
        return Math.floor(+Date.now() / 1000);
    }

    timestamp(){
        return +Date.now();
    }
}

export const timeUtils = new TimeUtils();