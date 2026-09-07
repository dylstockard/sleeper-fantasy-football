FROM python:3.12-slim

WORKDIR /app

COPY src/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD uvicorn src.backend.api:app --host 0.0.0.0 --port ${PORT:-8000}
