import math

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    Returns distance in meters
    """
    R = 6371000  # Earth radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def is_gps_valid(checkpoint_lat, checkpoint_lon, user_lat, user_lon, radius):
    """
    Check if user is within the required radius of checkpoint
    Returns (is_valid, distance)
    """
    distance = haversine_distance(checkpoint_lat, checkpoint_lon, user_lat, user_lon)
    return distance <= radius, distance





