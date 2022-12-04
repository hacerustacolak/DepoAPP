FROM mcr.microsoft.com/dotnet/aspnet:6.0
ARG source
WORKDIR /app
COPY ${source:-.} .
ENTRYPOINT ["dotnet", "Depo.BackgroundServices.dll"]
