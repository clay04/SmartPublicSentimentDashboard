KNOWN_LOCATIONS = [
    "Jakarta",
    "Surabaya",
    "Bandung",
    "Manado",
    "Makassar",
    "Medan"
]


def extract_location(text: str):
    for location in KNOWN_LOCATIONS:
        if location.lower() in text.lower():
            return location

    return None