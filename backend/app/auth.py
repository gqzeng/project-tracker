import secrets
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from app.config import settings

security = HTTPBasic(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPBasicCredentials] = Depends(security),
) -> Optional[str]:
    if not settings.auth_username or not settings.auth_password:
        return None  # auth disabled

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Basic"},
        )

    username_ok = secrets.compare_digest(
        credentials.username.encode(), settings.auth_username.encode()
    )
    password_ok = secrets.compare_digest(
        credentials.password.encode(), settings.auth_password.encode()
    )

    if not (username_ok and password_ok):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )

    return credentials.username
