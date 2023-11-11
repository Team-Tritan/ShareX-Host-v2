FROM golang:latest
WORKDIR /app
COPY . .
ENV GOPROXY=direct
RUN go build -o main .
EXPOSE 8080
CMD ["./main"]
