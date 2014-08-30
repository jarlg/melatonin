J = require './julian_date.coffee'
H = require './helpers.coffee'


# http://en.wikipedia.org/wiki/Declination_of_the_Sun using julian date,
# calculate ecliptic coordinates of the sun then, calculate equatorial
# coordinates which convert easily to horizontal coordinates, from which we
# get the ALTIDTUDE of the sun as desired
#
# takes longitude and latitude of observer position (geolocation)

obj =
    axial_tilt: 23.439

    get_ecliptic_long: (l, g) ->
        l + 1.915*H.angle_sin(g) + 0.02*H.angle_sin(2*g)

    get_right_ascension: (ecliptic_long) ->
        H.angle_atan(H.angle_cos(@axial_tilt) * H.angle_tan(ecliptic_long))

    # +longitude; positive east
    get_hour_angle: (jd, longitude, right_ascension) ->
        H.between 0, 360, @get_gst(jd) + longitude - right_ascension

    get_declination: (ecliptic_long) ->
        H.angle_asin(H.angle_sin(@axial_tilt) * H.angle_sin(ecliptic_long))

    get_altitude: (date, latitude, longitude) ->
        jd = J.get_julian_date date
        jdn = J.get_jdn jd

        l = H.between 0, 360, 280.460 + 0.9856474*jdn
        g = H.between 0, 360, 357.528 + 0.9856003*jdn

        ec_long = @get_ecliptic_long l, g
        r_asc = @get_right_ascension ec_long

        ## make sure right_ascension is in same quadrant as ecliptic_long
        while H.angleToQuadrant(ec_long) != H.angleToQuadrant(r_asc)
            r_asc += if r_asc < ec_long then 90 else -90

        dec = @get_declination ec_long
        ha = @get_hour_angle jd, longitude, r_asc

        #altitude
        H.angle_asin(H.angle_sin(latitude)*H.angle_sin(dec) + H.angle_cos(latitude)*H.angle_cos(dec)*H.angle_cos(ha))

    get_last_jd_midnight: (jd) ->
        if jd >= Math.floor jd + 0.5
            Math.floor(jd - 1) + 0.5
        else
            Math.floor(jd) + 0.5

    get_ut_hours: (jd, last_jd_midnight) ->
        24 * (jd - last_jd_midnight)

    get_gst_hours: (jdn_midnight, ut_hours) ->
        gmst = 6.697374558 + 0.06570982441908*jdn_midnight + 1.00273790935*ut_hours
        H.between 0, 24, gmst

    #     http:#aa.usno.navy.mil/faq/docs/GAST.php
    #     julian date midnight is every .5 (half)
    get_gst: (jd) ->
        # gst : greenwich mean sidereal time

        jdm = @get_last_jd_midnight jd

        # gst -> local sidereal time done by adding or subtracting local longitude
        # in hours (degrees / 15). If local position is east of greenwich, then
        # add, else subtract.

        # in degrees!
        15 * @get_gst_hours J.get_jdn(jdm), @get_ut_hours jd, jdm


module.exports = obj
