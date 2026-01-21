import { IUserRepository } from '../../../core/ports/IUserRepository';
import { User } from '../../../core/entities/User';
import { UserModel } from './UserModel';

export class MongoUserRepository implements IUserRepository {
  async save(user: User): Promise<void> {
    const existingUser = await UserModel.findOne({ email: user.email });

    if (existingUser) {
      existingUser.kycLevel = user.kycLevel;
      existingUser.wallet = user.wallet;
      existingUser.balance = user.balance;
      existingUser.rewardsHistory = user.rewardsHistory;
      existingUser.nequiNumber = user.nequiNumber;
      await existingUser.save();
    } else {
      await UserModel.create({
        _id: user.id, // Explicitly save the ID
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        kycLevel: user.kycLevel,
        wallet: user.wallet,
        balance: user.balance,
        rewardsHistory: user.rewardsHistory,
        nequiNumber: user.nequiNumber,
      });
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);
  }

  private toDomain(doc: any): User {
    return new User(
      doc._id.toString(), // Pass ID
      doc.email,
      doc.name,
      doc.passwordHash,
      doc.kycLevel,
      doc.wallet,
      doc.balance,
      doc.rewardsHistory,
      doc.nequiNumber
    );
  }
}
