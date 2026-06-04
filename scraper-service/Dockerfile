FROM mcr.microsoft.com/playwright/python:v1.52.0-jammy

WORKDIR /app

COPY requirements.txt .

RUN pip install uv
RUN uv pip install --system -r requirements.txt

COPY . .

CMD ["python", "main.py"]