FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install uv
RUN uv pip install --system --index-url https://download.pytorch.org/whl/cpu torch==2.3.1+cpu
RUN uv pip install --system --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]