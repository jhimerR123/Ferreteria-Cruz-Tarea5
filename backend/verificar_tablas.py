
from sqlalchemy import inspect
from app.database import engine

inspector = inspect(engine)

tablas = inspector.get_table_names(schema="public")

print("=" * 60)
print("BASE DE DATOS: FERRETERIA CRUZ")
print("TOTAL DE TABLAS:", len(tablas))
print("=" * 60)

for tabla in sorted(tablas):
    print(f"\nTABLA: {tabla}")
    print("-" * 60)

    columnas = inspector.get_columns(
        tabla,
        schema="public"
    )

    for columna in columnas:
        nombre = columna["name"]
        tipo = columna["type"]
        nullable = columna["nullable"]

        print(
            f"Campo: {nombre} | "
            f"Tipo: {tipo} | "
            f"Permite NULL: {nullable}"
        )

    claves = inspector.get_foreign_keys(
        tabla,
        schema="public"
    )

    for clave in claves:
        print(
            f"FK: {clave['constrained_columns']} "
            f"-> {clave['referred_table']} "
            f"{clave['referred_columns']}"
        )

print("\nVERIFICACION FINALIZADA")
