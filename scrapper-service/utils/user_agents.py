from fake_useragent import UserAgent

ua = UserAgent()

def get_random_user_agent():

    try:
        return ua.random

    except Exception:

        return (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        )