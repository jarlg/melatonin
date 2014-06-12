J = require './julian_date.coffee'
H = require './helpers.coffee'


# http://en.wikipedia.org/wiki/Declination_of_the_Sun using julian date,
# calculate ecliptic coordinates of the sun then, calculate equatorial
# coordinates which convert easily to horizontal coordinates, from which we
# get the ALTIDTUDE of the sun as desired
#
# takes longitude and latitude of observer position (geolocation)

obj =
    get_sun_altitude: (date, longitude, latitude) ->
        jd = J.get_julian date
        jdn = jd - 2451545.0

        l = H.between 0, 360, 280.460 + 0.9856474*jdn
        g = H.between 0, 360, 357.528 + 0.9856003*jdn

        # ecliptic coordinates (except beta which we don't need)
        ecliptic_long = l + 1.915*H.angle_sin(g) + 0.02*H.angle_sin(2*g)
        dist_to_sun = 1.00014 - 0.01671*H.angle_cos(g) - 0.00014*H.angle_cos(2*g)
        axial_tilt = 23.4

        right_ascension = H.angle_atan(H.angle_cos(axial_tilt) * H.angle_tan(ecliptic_long))

        ## make sure right_ascension is in same quadrant as ecliptic_long
        while H.angleToQuadrant(ecliptic_long) != H.angleToQuadrant(right_ascension)
            right_ascension += 90
            right_ascension -= 360 if right_ascension > 360

        # +latitude; positive east
        hour_angle = H.between 0, 360, @greenwich_sidereal_time(jd) + longitude - right_ascension

        declination = H.angle_asin(H.angle_sin(axial_tilt) * H.angle_cos(ecliptic_long))

        #altitude
        H.angle_asin(H.angle_sin(longitude)*H.angle_sin(declination) + H.angle_cos(longitude)*H.angle_cos(declination)*H.angle_cos(hour_angle))

    #     http:#aa.usno.navy.mil/faq/docs/GAST.php
    #     julian date midnight is every .5 (half)
    greenwich_sidereal_time: (jd) ->
        # gmst : greenwich mean sidereal time
        # gast : greenwich apparent sidereal time
    
        # find last midnight jd0
        if jd >= Math.floor jd + 0.5
            last_jd_midnight = Math.floor(jd - 1) + 0.5
        else
            last_jd_midnight = Math.floor(jd) + 0.5

        ut_hours  = 24 * (jd - last_jd_midnight)

        d = jd - 2451545.0
        d0 = last_jd_midnight - 2451545.0
        #T = d / 36525

        # in hours!
        gmst = 6.697374558 + 0.06570982441908*d0 + 1.00273790935*ut_hours #+ 0.000026*T*T
        gmst = H.between 0, 24, gmst

        omega = 125.04 - 0.052954*d
        l = 280.47 + 0.98565*d
        eqeq = H.angle_cos(23.4393 - 0.0000004*d) * (-0.000319*H.angle_sin(omega)) - 0.000024*H.angle_sin(2*l)

        # in hours!
        gast = gmst - eqeq

        # gast -> local sidereal time done by adding or subtracting local longitude
        # in hours (degrees / 15). If local position is east of greenwich, then
        # add, else subtract.

        # in degrees!
        gast * 15


module.exports = obj
