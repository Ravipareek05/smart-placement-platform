FROM gcc:13

WORKDIR /app

COPY run.cpp .

RUN g++ run.cpp -o run

CMD ["./run"]