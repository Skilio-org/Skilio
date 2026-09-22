from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher
from pwdlib.hashers.bcrypt import BcryptHasher

from app.core.config import settings

password_hash = PasswordHash(
    (
        Argon2Hasher(),
        BcryptHasher(),
    )
)


ALGORITHM = "HS256"


def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.now(UTC) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(
    plain_password: str, hashed_password: str
) -> tuple[bool, str | None]:
    if not plain_password or len(plain_password) < 8: return False, None
    return password_hash.verify_and_update(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return password_hash.hash(password)


def generate_random_password(length: int = 8) -> str:
    """
    Generate a random password with a mix of uppercase, lowercase, digits, and special characters.

    Args:
        length (int): Length of the password. Default is 12.

    Returns:
        str: The generated random password.
    """
    if length < 8:
        raise ValueError("Password length must be at least 8 characters.")
    lower = string.ascii_lowercase
    upper = string.ascii_uppercase
    digits = string.digits
    special = string.punctuation

    # Ensure the password has at least one character from each pool
    all_characters = lower + upper + digits + special
    password = [
        random.choice(lower),
        random.choice(upper),
        random.choice(digits),
        random.choice(special),
    ]

    password += random.choices(all_characters, k=length - 4)
    random.shuffle(password)
    return ''.join(password)