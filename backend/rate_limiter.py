"""
backend/rate_limiter.py — Rate Limiting Middleware / Dependency (Layer 11)
Protects authentication and sensitive endpoints from brute-force and flood attacks.
Returns HTTP 429 Too Many Requests when threshold is exceeded.
"""
import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

class SimpleRateLimiter:
    def __init__(self, max_requests: int = 15, window_seconds: int = 900):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.history = defaultdict(list)

    def _cleanup(self, now: float, key: str):
        cutoff = now - self.window_seconds
        self.history[key] = [t for t in self.history[key] if t > cutoff]

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        self._cleanup(now, key)
        if len(self.history[key]) >= self.max_requests:
            return False
        self.history[key].append(now)
        return True

    def get_retry_after(self, key: str) -> int:
        now = time.time()
        if not self.history[key]:
            return 0
        oldest = self.history[key][0]
        remaining = int(self.window_seconds - (now - oldest))
        return max(remaining, 1)

# Global rate limiters
auth_limiter = SimpleRateLimiter(max_requests=15, window_seconds=900)  # 15 attempts per 15 mins

def check_auth_rate_limit(request: Request):
    """FastAPI dependency to rate limit authentication endpoints by client IP."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    
    # Check X-Forwarded-For if behind reverse proxy (Render / Vercel)
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()

    if not auth_limiter.is_allowed(client_ip):
        retry_after = auth_limiter.get_retry_after(client_ip)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many authentication attempts. Please try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )
