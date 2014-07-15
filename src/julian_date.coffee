jd = 
    get_julian_day: (date) ->
        a = if date.getUTCMonth() < 2 then 1 else 0 # 1 for feb and jan, 0 else
        y = date.getUTCFullYear() + 4800 - a
        m = (date.getUTCMonth()+1) + 12 * a - 3 # 11 for feb, 0 for mar
        date.getUTCDate() + Math.floor((153*m + 2)/5) + 365*y + Math.floor((y/4)) - Math.floor((y/100)) + Math.floor((y/400)) - 32045

    get_julian_date: (date) ->
        @get_julian_day(date) + (date.getUTCHours() - 12)/24 + date.getUTCMinutes()/1440 + date.getUTCSeconds()/86400

    get_jdn: (jd) -> jd - 2451545.0


module.exports = jd
