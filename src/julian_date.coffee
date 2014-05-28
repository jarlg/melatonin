jd = 
    get_julian: (date) ->
        a = if date.getMonth() < 2 then 1 else 0 # 1 for feb and jan, 0 else
        y = date.getFullYear() + 4800 - a
        m = (date.getMonth()+1) + 12 * a - 3 # 11 for feb, 0 for mar
        jdn = date.getDate() + Math.floor((153*m + 2)/5) + 365*y + Math.floor((y/4)) - Math.floor((y/100)) + Math.floor((y/400)) - 32045

        jdn + (date.getHours() - 12)/24 + date.getMinutes()/1440 + date.getSeconds()/86400

module.exports = jd
