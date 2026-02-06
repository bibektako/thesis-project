"""
Seeder script to create admin user and sample challenges
Run with: python seed.py
"""
import asyncio
from datetime import datetime, timezone
from bson import ObjectId

from db import connect_db, get_database
from routers.auth import get_password_hash
from config import DATABASE_NAME


async def create_admin_user():
    """Create admin user if it doesn't exist"""
    db = get_database()
    
    admin_email = "admin@trekchallenge.com"
    admin_username = "admin"
    admin_password = "admin123"  # Change this in production!
    
    # Check if admin exists
    existing = await db.users.find_one({"email": admin_email})
    if existing:
        print(f"✅ Admin user already exists: {admin_email}")
        return existing
    
    # Create admin user
    admin_user = {
        "username": admin_username,
        "email": admin_email,
        "password_hash": get_password_hash(admin_password),
        "role": "admin",
        "face_consent": False,
        "face_embedding": None,
        "created_at": datetime.now(timezone.utc),
        "points": 0
    }
    
    result = await db.users.insert_one(admin_user)
    admin_user["_id"] = result.inserted_id
    
    print(f"✅ Admin user created:")
    print(f"   Email: {admin_email}")
    print(f"   Username: {admin_username}")
    print(f"   Password: {admin_password}")
    print(f"   Role: admin")
    
    return admin_user


async def create_sample_challenges():
    """Create sample challenges with checkpoints"""
    db = get_database()
    
    # Check if challenges already exist
    existing_count = await db.challenges.count_documents({})
    if existing_count > 0:
        print(f"✅ {existing_count} challenge(s) already exist")
        return
    
    # Get admin user
    admin = await db.users.find_one({"role": "admin"})
    if not admin:
        print("❌ Admin user not found. Please create admin first.")
        return
    
    challenges_data = [
        {
            "title": "Mountain Trail Challenge",
            "description": "A challenging mountain trail with 5 checkpoints. Perfect for experienced hikers!",
            "checkpoints": [
                {
                    "checkpoint_id": "mt-001",
                    "title": "Trail Head",
                    "description": "Start your journey at the trail head sign",
                    "latitude": 37.7749,
                    "longitude": -122.4194,
                    "expected_sign_text": "Mountain Trail Head",
                    "require_selfie": False,
                    "require_photo": True,
                    "order_index": 1,
                    "gps_required": True,
                    "gps_radius": 50.0
                },
                {
                    "checkpoint_id": "mt-002",
                    "title": "First Viewpoint",
                    "description": "Reach the first scenic viewpoint",
                    "latitude": 37.7759,
                    "longitude": -122.4204,
                    "expected_sign_text": "Viewpoint 1",
                    "require_selfie": True,
                    "require_photo": True,
                    "order_index": 2,
                    "gps_required": True,
                    "gps_radius": 30.0
                },
                {
                    "checkpoint_id": "mt-003",
                    "title": "Waterfall",
                    "description": "Find the hidden waterfall",
                    "latitude": 37.7769,
                    "longitude": -122.4214,
                    "expected_sign_text": "Waterfall",
                    "require_selfie": False,
                    "require_photo": True,
                    "order_index": 3,
                    "gps_required": True,
                    "gps_radius": 40.0
                },
                {
                    "checkpoint_id": "mt-004",
                    "title": "Summit",
                    "description": "Reach the mountain summit",
                    "latitude": 37.7779,
                    "longitude": -122.4224,
                    "expected_sign_text": "Summit Peak",
                    "require_selfie": True,
                    "require_photo": True,
                    "order_index": 4,
                    "gps_required": True,
                    "gps_radius": 25.0
                },
                {
                    "checkpoint_id": "mt-005",
                    "title": "Finish Line",
                    "description": "Complete the challenge at the finish line",
                    "latitude": 37.7789,
                    "longitude": -122.4234,
                    "expected_sign_text": "Finish Line",
                    "require_selfie": False,
                    "require_photo": True,
                    "order_index": 5,
                    "gps_required": True,
                    "gps_radius": 50.0
                }
            ],
            "created_by": str(admin["_id"]),
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "points_per_checkpoint": 10
        },
        {
            "title": "City Park Walk",
            "description": "A relaxing walk through the city park with 3 checkpoints. Great for beginners!",
            "checkpoints": [
                {
                    "checkpoint_id": "cp-001",
                    "title": "Park Entrance",
                    "description": "Enter through the main park gate",
                    "latitude": 37.7849,
                    "longitude": -122.4094,
                    "expected_sign_text": "City Park Entrance",
                    "require_selfie": False,
                    "require_photo": True,
                    "order_index": 1,
                    "gps_required": True,
                    "gps_radius": 50.0
                },
                {
                    "checkpoint_id": "cp-002",
                    "title": "Fountain",
                    "description": "Find the central fountain",
                    "latitude": 37.7859,
                    "longitude": -122.4104,
                    "expected_sign_text": "Central Fountain",
                    "require_selfie": False,
                    "require_photo": True,
                    "order_index": 2,
                    "gps_required": True,
                    "gps_radius": 30.0
                },
                {
                    "checkpoint_id": "cp-003",
                    "title": "Garden",
                    "description": "Visit the beautiful garden",
                    "latitude": 37.7869,
                    "longitude": -122.4114,
                    "expected_sign_text": "Garden Area",
                    "require_selfie": True,
                    "require_photo": True,
                    "order_index": 3,
                    "gps_required": True,
                    "gps_radius": 40.0
                }
            ],
            "created_by": str(admin["_id"]),
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "points_per_checkpoint": 5
        },
        {
            "title": "Beach Trail Adventure",
            "description": "Explore the beautiful beach trail with 4 checkpoints",
            "checkpoints": [
                {
                    "checkpoint_id": "bt-001",
                    "title": "Beach Start",
                    "description": "Begin at the beach trail marker",
                    "latitude": 37.7649,
                    "longitude": -122.4294,
                    "expected_sign_text": "Beach Trail Start",
                    "require_selfie": False,
                    "require_photo": True,
                    "order_index": 1,
                    "gps_required": True,
                    "gps_radius": 50.0
                },
                {
                    "checkpoint_id": "bt-002",
                    "title": "Lighthouse",
                    "description": "Reach the historic lighthouse",
                    "latitude": 37.7659,
                    "longitude": -122.4304,
                    "expected_sign_text": "Historic Lighthouse",
                    "require_selfie": True,
                    "require_photo": True,
                    "order_index": 2,
                    "gps_required": True,
                    "gps_radius": 35.0
                },
                {
                    "checkpoint_id": "bt-003",
                    "title": "Cliff View",
                    "description": "Enjoy the cliff view point",
                    "latitude": 37.7669,
                    "longitude": -122.4314,
                    "expected_sign_text": "Cliff Viewpoint",
                    "require_selfie": False,
                    "require_photo": True,
                    "order_index": 3,
                    "gps_required": True,
                    "gps_radius": 40.0
                },
                {
                    "checkpoint_id": "bt-004",
                    "title": "Beach End",
                    "description": "Complete at the beach end marker",
                    "latitude": 37.7679,
                    "longitude": -122.4324,
                    "expected_sign_text": "Trail End",
                    "require_selfie": True,
                    "require_photo": True,
                    "order_index": 4,
                    "gps_required": True,
                    "gps_radius": 50.0
                }
            ],
            "created_by": str(admin["_id"]),
            "created_at": datetime.now(timezone.utc),
            "is_active": True,
            "points_per_checkpoint": 8
        }
    ]
    
    # Insert challenges
    result = await db.challenges.insert_many(challenges_data)
    print(f"✅ Created {len(result.inserted_ids)} challenges:")
    for i, challenge in enumerate(challenges_data, 1):
        print(f"   {i}. {challenge['title']} ({len(challenge['checkpoints'])} checkpoints)")


async def main():
    """Main seeder function"""
    print("🌱 Starting seeder...")
    print("=" * 50)
    
    # Connect to database
    await connect_db()
    print(f"✅ Connected to database: {DATABASE_NAME}")
    print()
    
    # Create admin user
    print("👤 Creating admin user...")
    await create_admin_user()
    print()
    
    # Create challenges
    print("🏔️  Creating challenges...")
    await create_sample_challenges()
    print()
    
    print("=" * 50)
    print("✅ Seeder completed successfully!")
    print()
    print("📝 Summary:")
    print("   • Admin user created/verified")
    print("   • Sample challenges created")
    print()
    print("🔑 Admin credentials:")
    print("   Email: admin@trekchallenge.com")
    print("   Password: admin123")
    print()
    print("⚠️  Remember to change the admin password in production!")


if __name__ == "__main__":
    asyncio.run(main())

